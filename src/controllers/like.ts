import { LikeModel } from './../models/like-model';
import { getAuthUserEmail, getUIDAccessVerificationMid, hasAdminAccessPolicy } from './../middlewares/authentication-middleware';
import { internalServerErrorStatusData, forbiddenStatusData, notFoundStatusData, LOCALIZATION_HEADER, conflictStatusData } from './../utils/contat-strings';
import { createdLocalization, StatusCode } from '../utils/status-code';
import { validationResultMid } from './../middlewares/validation-result-midleware';
import { likeValidator } from './../validators/like-validator';
import { LikeDto, LikeDtoFieldNames } from './../dtos/like-dto';
import * as express from 'express';
import * as admin from 'firebase-admin';
import { authMid, getAuthUserId } from '../middlewares/authentication-middleware';
import { isFbError } from '../utils/type-guards';
import { sendLikeNotification } from '../models/notification-model';

const likeController = express.Router();
const LIKE_SEGMENT = '/like';
const GET_LIKE_SEGMENT = '/like/:likeId';

const likeUserAction: express.RequestHandler<{}, any, LikeDto> = async (req, res) => {
  const { targetUserId, sourceUserId } = req.body;
  const firestore = admin.firestore();

  const checkQuery = firestore.collection('likes')
    .where(LikeDtoFieldNames.sourceUserId, '==', sourceUserId)
    .where(LikeDtoFieldNames.targetUserId, '==', targetUserId);

  const checkSnap = await checkQuery.get();

  if (!checkSnap.empty) {
    res.status(StatusCode.conflict).json(conflictStatusData)
  }
  
  try {
    await admin.auth().getUser(targetUserId);
  } catch (e) {
    if (isFbError(e) && e.code === 'auth/user-not-found') {
      res.status(StatusCode.notFound).json(e);
      return;
    }
    res.status(StatusCode.internalServerError).json(internalServerErrorStatusData);
    return;
  }

  const likesCollection = firestore.collection('likes');
  let docId: string
  try {
    const newLike: LikeModel = { ...req.body, createdAt: new Date().toJSON() }
    const docSnap = await likesCollection.add(newLike);
    docId = docSnap.id;

    const currentAuthUserEmail = getAuthUserEmail(req);
    await sendLikeNotification(sourceUserId, currentAuthUserEmail, targetUserId, firestore);
    
  } catch (e) {
    res.status(StatusCode.internalServerError).json(internalServerErrorStatusData);
    return;
  }
  
  res.setHeader(LOCALIZATION_HEADER, createdLocalization(req, `like/${docId}`));
  res.status(StatusCode.created).end();
};

const getLikeAction: express.RequestHandler<{ likeId: string }> = async (req, res) => {
  const uid = getAuthUserId(req);
  const docRef = admin.firestore().doc(`likes/${req.params.likeId}`);
  let docSnapshot: admin.firestore.DocumentSnapshot;

  try {
    docSnapshot = await docRef.get() as any;
  } catch {
    res.status(StatusCode.internalServerError).json(internalServerErrorStatusData);
    return;
  }

  if (!docSnapshot.exists) {
    res.status(StatusCode.notFound).json(notFoundStatusData);
    return
  }

  const data = docSnapshot.data() as LikeModel;

  if (data.sourceUserId !== uid) {
    try {
      if (!(await hasAdminAccessPolicy(uid))) {
        res.status(StatusCode.forbidden).json(forbiddenStatusData);
      }
    } catch {
      res.status(StatusCode.internalServerError).json(internalServerErrorStatusData)
    }
  }

  const likeDto: LikeDto = { sourceUserId: data.sourceUserId, targetUserId: data.targetUserId}
  res.status(StatusCode.ok).json(likeDto);

};

likeController.post(
  LIKE_SEGMENT, 
  authMid, 
  likeValidator, 
  validationResultMid,
  getUIDAccessVerificationMid('body', LikeDtoFieldNames.sourceUserId),
  likeUserAction
);

likeController.get(
  GET_LIKE_SEGMENT,
  authMid,
  getLikeAction
);

export default likeController;