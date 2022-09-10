import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { updateMetadataAfterRemovedUser, updateMetadataAfterUserLogin } from '../models/user-metadata-model';
import { CLOUD_VERIFICATION_UUID } from "../utils/contat-strings";

export const onAuthCreate = functions.auth.user().onCreate(async ({ uid }) => {
  await _whaitFor1Sec();
  const userRecord = await admin.auth().getUser(uid);
  if (!userRecord.customClaims || userRecord.customClaims!.CLOUD_VERIFICATION_UUID !== CLOUD_VERIFICATION_UUID) {
    await admin.auth().deleteUser(userRecord.uid);
    return;
  }
});

export const onAuthDelete = functions.auth.user().onDelete(async () => {
  const firestore = admin.firestore();
  await updateMetadataAfterRemovedUser(firestore);
});

export const userLogin = functions.https.onCall(async (_, context) => {
  if (!context.auth) { return; }
  const firestore = admin.firestore();
  await updateMetadataAfterUserLogin(firestore, context.auth.uid);
});

export const userLogout = functions.https.onCall(async (uid) => {
  const firestore = admin.firestore();
  await updateMetadataAfterUserLogin(firestore, uid);
});

function _whaitFor1Sec(): Promise<void> {
  return new Promise((res) => {
    setTimeout(() => res(), 1000);
  });
}