import { UserModelFieldNames } from './../models/user-model';
import { UserMetadataModel } from './../models/user-metadata-model';
import { LikeModel, LikeModelFieldNames } from './../models/like-model';
import { UserToReturnDto } from './../dtos/user-to-return-dto';
import { getAuthUserId, getUIDAccessVerificationMid, isUserAuthenticated, optionalAuthMid, authMid } from './../middlewares/authentication-middleware';
import { EMAIL_ALREADY_EXIST, USER_NOT_FOUND, internalServerErrorStatusData, USERS_METADATA_DOC_PATH } from './../utils/contat-strings';
import { StatusCode } from '../utils/status-code';
import { validationResultMid } from './../middlewares/validation-result-midleware';
import { addressInfoSanitizor } from './../sanitizors/address-info-sanitizor';
import { patchUserSanitizor } from './../sanitizors/patch-user-sanitizor';
import { addressInfoValidator } from './../validators/address-info-validator';
import { AddressInfoDto, AddressInfoDtoFieldNames } from './../dtos/address-info-dto';
import { patchUserValidator } from './../validators/patch-user-validator';
import { SignUpDtoFieldNames } from './../dtos/sign-up-dto';
import { PatchUserDto, PatchUserDtoFieldNames } from './../dtos/patch-user-dto';
import * as express from 'express';
import * as admin from 'firebase-admin';
import { isFbError } from '../utils/type-guards';
import { getUsersValidator } from '../validators/get-users-validator';
import { body } from 'express-validator';

const userController = express.Router()
const USER_SEGMENT = '/user';
const USER_ADDRESS_INFO_SEGMENT = '/user/address-info';
const GET_USER_SEGMENT = '/user/:userId'
const DELETE_IMAGE_SEGMENT = '/user/remove-image-url';

const patchUserAction: express.RequestHandler<{}, any, PatchUserDto> = async (req, res) => {
  const uid = getAuthUserId(req);
  if (req.body.fieldName === SignUpDtoFieldNames.email || req.body.fieldName == SignUpDtoFieldNames.password) {
    try {
      await admin.auth().updateUser(uid, { [req.body.fieldName]: req.body.newValue })
      res.status(StatusCode.noContent).end()
    } catch (e) {
      if (isFbError(e) && e.code === EMAIL_ALREADY_EXIST) {
        res.status(StatusCode.conflict).json(e);
        return;
      }
      res.status(StatusCode.internalServerError).json(e);
      return;
    }

    if (req.body.fieldName == SignUpDtoFieldNames.password) {
      return;
    }
  }

  const docRef = admin.firestore().doc(`users/${uid}`);
  try {
    await docRef.update({ [req.body.fieldName]: req.body.newValue });
    res.status(StatusCode.noContent).end();
    return;
  } catch (e) {
    res.status(StatusCode.internalServerError).json(e);
    return
  }
}

const patchAddressInfoAction: express.RequestHandler<{}, any, AddressInfoDto> = async (req, res) => {
  const uid = getAuthUserId(req);
  const { city, street, state, country } = req.body;
  const docRef = admin.firestore().doc(`users/${uid}`);
  try {
    await docRef.update({ city, street, state, country });
    res.status(StatusCode.noContent).end();
    return;
  } catch (e) {
    res.status(StatusCode.internalServerError).json(internalServerErrorStatusData);
  }

}

const getUserAction: express.RequestHandler<{ userId: string }> = async (req, res) => {

  const firestore = admin.firestore();

  try {
    const userRecord = await admin.auth().getUser(req.params.userId);
    const userToReturn = (await firestore.doc(`users/${userRecord.uid}`).get()).data() as UserToReturnDto;

    if (isUserAuthenticated(req)) {
      const authUserUid = getAuthUserId(req);
      const querySnap = await firestore.collection('likes')
        .where(LikeModelFieldNames.sourceUserId, '==', authUserUid)
        .where(LikeModelFieldNames.targetUserId, '==', req.params.userId )
        .get();
      
      if (!querySnap.empty) {
        userToReturn.liked = true;
      }
    }

    res.status(StatusCode.ok).json(userToReturn);

  } catch (e) {
    if (isFbError(e) && e.code === USER_NOT_FOUND) {
      res.status(StatusCode.notFound).json(e);
      return;
    }
    res.status(StatusCode.internalServerError).json(internalServerErrorStatusData);
    return;
  }
};

const getUsersAction: express.RequestHandler<{}, unknown, unknown, { offset: string, limit: string, gender?: string }> = async (req, res) => {
  const offset = +req.query.offset;
  const limit = +req.query.limit;
  const gender = req.query.gender;
  const firestore = admin.firestore();
  const currentUserId = isUserAuthenticated(req) ? getAuthUserId(req) : undefined;
  let totalPages: number;
  let totalUsers: number;
  let usersQuery: admin.firestore.Query;
  

  const usersMetadataSnap = await firestore.doc(USERS_METADATA_DOC_PATH).get()

  if (!usersMetadataSnap.exists) {
    res.setHeader('PAGINATION-TOTAL-USERS', 0)
    res.setHeader('PAGINATION-TOTAL-PAGES', 0)
    res.status(StatusCode.noContent).json([]);
    return;
  }

  const metadata = usersMetadataSnap.data() as UserMetadataModel
  
  if (currentUserId ? (metadata.count <= 1) : (metadata.count === 0)) {
    res.setHeader('PAGINATION-TOTAL-USERS', 0)
    res.setHeader('PAGINATION-TOTAL-PAGES', 0)
    res.status(StatusCode.noContent).json([]);
    return;
  }

  usersQuery = firestore.collection('users').orderBy(UserModelFieldNames.createdAt);
  //#region - Calculating total count of members base on gender param
  if (gender) {
    usersQuery.where(UserModelFieldNames.gender, '==', gender);
    if (gender === 'male') {
      totalUsers = metadata.maleCount;
    } else {
      totalUsers = metadata.femaleCount;
    }
  } else {
    totalUsers = metadata.count
  }
  //#endregion

  usersQuery = usersQuery.offset(offset).limit(limit);

  const users = (await usersQuery.get()).docs.map((snap) => {
    const user: UserToReturnDto = snap.data()! as any;
    user.liked = false;
    return user;
  });

  //#region - Updating users with likes from auth user
  if (currentUserId) {
    const currentUserIndex = users.findIndex((user) => user.userId === currentUserId)
    if (currentUserIndex > -1) {
      users.splice(currentUserIndex, 1);
    }

    const UIDs = users.map((user) => user.userId)
    const UIDsChunks: string[][] = [];
    
    for (let i = 0; i < UIDs.length; i += 10) {
      const end = i + 9;
      if (end < UIDs.length) {
        UIDsChunks.push(UIDs.slice(i, i + 9));
      } else {
        UIDsChunks.push(UIDs.slice(i));
      }
    }

    const likesColBaseQuery = firestore.collection('likes').where(LikeModelFieldNames.sourceUserId, '==', currentUserId);

    for (const uids of UIDsChunks) {
      const likesColSnap = await likesColBaseQuery.where(LikeModelFieldNames.targetUserId, 'in', uids).get();

      if (likesColSnap.empty) { continue; }

      likesColSnap.docs.forEach((docSnap) => {
        const index = UIDs.indexOf((docSnap.data() as LikeModel).targetUserId);
        if (index > -1) {
          users[index].liked = true;
        }
      })
    }
  }
  //#endregion
  
  totalPages = Math.ceil(totalUsers / limit);

  res.setHeader('PAGINATION-TOTAL-USERS', totalUsers);
  res.setHeader('PAGINATION-TOTAL-PAGES', totalPages);
  res.status(StatusCode.ok).json(users);
}

const removeMainImageUrlAction: express.RequestHandler<{}, unknown, { targetUserId: string }> = async (req, res) => {

  try {
    const uid = getAuthUserId(req);
    const docRef = admin.firestore().doc(`users/${uid}`);
    
    await docRef.update({ [UserModelFieldNames.mainPhotoUrl]: null });

    res.status(StatusCode.ok).end();
  } catch {
    res.status(StatusCode.internalServerError).json(internalServerErrorStatusData);
  }

}

userController.patch(
  USER_SEGMENT, 
  authMid, 
  patchUserValidator, 
  patchUserSanitizor, 
  validationResultMid,
  getUIDAccessVerificationMid('body', PatchUserDtoFieldNames.userId, 'admin'),
  patchUserAction
);

userController.patch(
  USER_ADDRESS_INFO_SEGMENT,
  authMid,
  addressInfoValidator,
  addressInfoSanitizor,
  validationResultMid, 
  getUIDAccessVerificationMid('body', AddressInfoDtoFieldNames.userId, 'admin'),
  patchAddressInfoAction
);

userController.patch(
  DELETE_IMAGE_SEGMENT,
  authMid,
  body('targetUserId').exists({ checkFalsy: true }),
  validationResultMid,
  getUIDAccessVerificationMid('body', 'targetUserId'),
  removeMainImageUrlAction
)

userController.get(
  USER_SEGMENT,
  getUsersValidator,
  validationResultMid, 
  optionalAuthMid,
  getUsersAction
)

userController.get(
  GET_USER_SEGMENT,
  optionalAuthMid,
  getUserAction
);

export default userController;