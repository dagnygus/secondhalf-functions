import * as admin from 'firebase-admin';
import { arrayUnion, decrement9, incrementOne } from '../utils/field-value-modifiers';
import { UserModel } from './user-model';

export interface NotificationsModel {
  size: number;
  notifications: NotificationModel[]
}

export enum NotificationsModelFieldNames {
  size = 'size',
  notifications = 'notifications'
}

export type NotificationModel = LikeNotificationModel | ChatNotificationModel;
export type NotificationType = 'like-notification' | 'chat-notification';

export const notificationTypes = new Set([
  'like-notification',
  'chat-notification'
]);

export interface LikeNotificationModel {
  type: 'like-notification';
  uid: string;
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  createdAt: string;
  photoUrl?: string | null | undefined;
}

export interface ChatNotificationModel {
  type: 'chat-notification';
  uid: string;
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  createdAt: string;
  messageContent: string;
  photoUrl?: string | null | undefined;
}

export async function sendLikeNotification(
  sourceUserId: string, 
  sourceEmail: 
  string, 
  targetUserId: string, 
  firestore: admin.firestore.Firestore
): Promise<void> {
  const sourceUserDocRef = firestore.doc(`users/${sourceUserId}`);
  const sourceUserData = (await sourceUserDocRef.get()).data() as UserModel;
  const notifocation = _getNotificationModel('like-notification', sourceUserId, sourceEmail, sourceUserData);
  await firestore.runTransaction(getNotificationTransactionCallback(targetUserId, notifocation, firestore));
}

export async function sendChatNotification(
  sourceUserId: string, 
  sourceEmail: string, 
  targetUserId: string, 
  messageContent: string,
  firestore: admin.firestore.Firestore
): Promise<void> {
  const sourceUserDocRef = firestore.doc(`users/${sourceUserId}`);
  const sourceUserData = (await sourceUserDocRef.get()).data() as UserModel;
  const notifocation = _getNotificationModel('chat-notification', sourceUserId, sourceEmail, sourceUserData, messageContent);
  await firestore.runTransaction(getNotificationTransactionCallback(targetUserId, notifocation, firestore));
}

function _getNotificationModel(type: 'like-notification', uid:string, email:string, userData: UserModel): LikeNotificationModel
function _getNotificationModel(type: 'chat-notification', uid:string, email:string, userData: UserModel, messageContent: string): ChatNotificationModel
function _getNotificationModel(type: NotificationType, uid:string, email:string, userData: UserModel, messageContent?: string): NotificationModel {

  const { firstName, lastName, nickName, mainPhotoUrl } = userData

  switch (type) {
    case 'chat-notification':
      const chatNotification: ChatNotificationModel = {
        type,
        uid,
        firstName,
        lastName,
        nickName,
        email,
        messageContent: messageContent!,
        createdAt: new Date().toJSON(),
      }
      if (mainPhotoUrl) {
        chatNotification.photoUrl = mainPhotoUrl;
      }
      return chatNotification
    case 'like-notification':
      const likeNotification: LikeNotificationModel = {
        type,
        uid,
        firstName,
        lastName,
        nickName,
        email,
        createdAt: new Date().toJSON(),
      }
      if (mainPhotoUrl) {
        likeNotification.photoUrl = mainPhotoUrl;
      }
      return likeNotification;
    default:
      return null!
  }
}

export function getNotificationTransactionCallback(uid: string, notification: NotificationModel, firestore: admin.firestore.Firestore): (transacton: admin.firestore.Transaction) => Promise<void> {
  return async (transaction) => {

    const notificationsDocRef = firestore.doc(`notifications/${uid}`);
    const notificationsSnap = await transaction.get(notificationsDocRef);
    
    if (!notificationsSnap.exists) {

      const notificationsModel: NotificationsModel = {
        size: 1,
        notifications: [ notification ]
      }

      transaction.create(notificationsDocRef, notificationsModel);
      return;
    }

    let fromUid: string | undefined;
    const currentNotifications = (notificationsSnap.get(NotificationsModelFieldNames.notifications) as NotificationModel[])

    if (_hasUid(notification)) {
      fromUid = notification.uid
      const alreadyContainingNotificationIndex = currentNotifications
        .findIndex((not) => not.type === notification.type && (not as any).uid === fromUid)

      if (alreadyContainingNotificationIndex > -1) {
        currentNotifications.splice(alreadyContainingNotificationIndex, 1);
        currentNotifications.unshift(notification);

        transaction.update(notificationsDocRef, {
          [NotificationsModelFieldNames.notifications]: currentNotifications
        });
        return;
      }
    }

    let newSize: admin.firestore.FieldValue;
    let notifications: NotificationModel[] | admin.firestore.FieldValue;

    if (notificationsSnap.get(NotificationsModelFieldNames.size) === 50) {
      newSize = decrement9;
      notifications = currentNotifications.slice(10);
      notifications.push(notification);
    } else {
      newSize = incrementOne;
      notifications = arrayUnion(notification);
    }

    transaction.update(notificationsDocRef, {
      [NotificationsModelFieldNames.size]: newSize,
      [NotificationsModelFieldNames.notifications]: notifications
    });
  }
}

function _hasUid(notification: any): notification is { uid: string } {
  return typeof notification.uid === 'string';
}