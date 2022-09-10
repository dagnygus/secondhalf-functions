// import { internalServerErrorStatusData } from './../utils/contat-strings';
import { SignUpDto } from './../dtos/sign-up-dto';
import { validationResultMid } from '../middlewares/validation-result-midleware';
import { signUpSanitizor } from './../sanitizors/sign-up-sanitizor';
import { UserModel } from '../models/user-model';
import * as admin from 'firebase-admin';
import * as express from 'express';
import { signUpValidator } from '../validators/sign-up-validator';
import { createdLocalization, StatusCode } from '../utils/status-code';
import { defaultClaimsForFemale, defaultClaimsForMale } from '../utils/claims';
import { isFbError } from '../utils/type-guards';
import { internalServerErrorStatusData, LOCALIZATION_HEADER, USER_NOT_FOUND } from '../utils/contat-strings';
import { updateMetadataAfterAddedUser } from '../models/user-metadata-model';
import { body } from 'express-validator';

const authController = express.Router();
const AUTH_SEGMENT = '/auth';
const EMAIL_IS_NOT_IN_USE_SEGMENT = '/auth/email-is-not-in-use';
// const DELETE_AUTH_SEGMENT = '/auth/:userId';

const postAuthAction: express.RequestHandler<{}, unknown, SignUpDto> = async (req, res) => {

  const { firstName, lastName, nickName, email, password, gender, dateOfBirth, aboutMySelf } = req.body
  let userRecord: admin.auth.UserRecord;
  const auth = admin.auth();

  try {
    userRecord = await auth.createUser({ email, password })
  } catch (e) {
    if (isFbError(e) && e.code === 'auth/email-already-exists') {
      res.status(StatusCode.conflict).json(e);
      return;
    }
    res.status(StatusCode.internalServerError).json(internalServerErrorStatusData);
    return;
  }

  if (gender === 'male') {
    await auth.setCustomUserClaims(userRecord!.uid, defaultClaimsForMale);
  } else {
    await auth.setCustomUserClaims(userRecord!.uid, defaultClaimsForFemale);
  }

  const firestoreUserModel: UserModel = {
    userId: userRecord.uid,
    firstName,
    lastName,
    nickName,
    email,
    gender,
    dateOfBirth,
    aboutMySelf,
    isActive: false,
    createdAt: new Date().toJSON()
  }

  const docPath = `users/${userRecord!.uid}`;
  const firestore = admin.firestore()
  const docRef = firestore.doc(docPath);
  await docRef.set(firestoreUserModel);
  await updateMetadataAfterAddedUser(firestore);

  res.setHeader(LOCALIZATION_HEADER, createdLocalization(req, docPath))
  res.status(StatusCode.created).end();
};

const emailIsNotInUse: express.RequestHandler<{}, unknown, { email: string }> = async  (req, res) => {
  try {
    await admin.auth().getUserByEmail(req.body.email);
    res.status(StatusCode.ok).json(false);

  } catch (error) {
    if (isFbError(error) && error.code === USER_NOT_FOUND) {
      res.status(StatusCode.ok).json(true);
    }
    res.status(StatusCode.internalServerError).end();
  }
}

authController.put(AUTH_SEGMENT, signUpValidator, signUpSanitizor, validationResultMid, postAuthAction);

authController.post(
  EMAIL_IS_NOT_IN_USE_SEGMENT,
  body('email').exists(),
  validationResultMid,
  emailIsNotInUse
)

export default authController;