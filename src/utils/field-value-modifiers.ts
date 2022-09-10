import * as admin from 'firebase-admin';

export const incrementOne = admin.firestore.FieldValue.increment(1);
export const decrementOne = admin.firestore.FieldValue.increment(-1);
export const arrayRemove = admin.firestore.FieldValue.arrayRemove.bind(admin.firestore.FieldValue);
export const arrayUnion = admin.firestore.FieldValue.arrayUnion.bind(admin.firestore.FieldValue);
export const decrement49 = admin.firestore.FieldValue.increment(-49);
export const decrement9 = admin.firestore.FieldValue.increment(-9);