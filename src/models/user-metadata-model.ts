import { incrementOne, decrementOne } from './../utils/field-value-modifiers';
import { Firestore } from '@google-cloud/firestore';
import { UserModelFieldNames } from './user-model';

export interface UserMetadataModel {
  count: number;
  active: number;
  femaleCount: number;
  maleCount: number
}

export enum UserMetadataModelFieldNames {
  count = "count",
  active = "active",
}

export async function updateMetadataAfterAddedUser(firestore: Firestore) {
  const docRef = firestore.doc('db_info/users_metadata');

  await firestore.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(docRef);
    
    if (!docSnap.exists) {
      const metadata: UserMetadataModel = {
        count: 1,
        active: 0,
        femaleCount: 0,
        maleCount: 0
      };
      transaction.create(docRef, metadata);
      return;
    }

    transaction.update(docRef, {
      [UserMetadataModelFieldNames.count]: incrementOne
    });
  });
}

export async function updateMetadataAfterRemovedUser(firestore: Firestore) {
  const docRef = firestore.doc('db_info/users_metadata');

  await firestore.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists) {
      return;
    }
    transaction.update(docRef, {
      [UserMetadataModelFieldNames.count]: decrementOne
    });
  });
}

export async function updateMetadataAfterUserLogin(firestore: Firestore, uid: string): Promise<void> {
  const userDocRef = firestore.doc(`users/${uid}`);
  const metadataDocRef = firestore.doc('db_info/users_metadata');

  await firestore.runTransaction(async (transaction) => {
    const userDocSnap = await transaction.get(userDocRef);
    const metadataDocSnap = await transaction.get(metadataDocRef);

    if (!(userDocSnap.exists && metadataDocSnap.exists)) { return; }

    transaction.update(userDocRef, { [UserModelFieldNames.isActive]: true });
    transaction.update(metadataDocRef, { [UserMetadataModelFieldNames.active]: incrementOne });
  });
}

export async function udpateMetadataAfterUserLogout(firestore: Firestore, uid: string): Promise<void> {
  const userDocRef = firestore.doc(`users/${uid}`);
  const metadataDocRef = firestore.doc('db_info/users_metadata');

  await firestore.runTransaction(async (transaction) => {
    const userDocSnap = await transaction.get(userDocRef);
    const metadataDocSnap = await transaction.get(metadataDocRef);

    if (!(userDocSnap.exists && metadataDocSnap.exists)) { return; }

    transaction.update(userDocRef, { [UserModelFieldNames.isActive]: false });
    transaction.update(metadataDocRef, { [UserMetadataModelFieldNames.active]: decrementOne });
  });
}