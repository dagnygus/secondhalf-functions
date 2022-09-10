import { DeleteNotificationDto, DeleteNotificationDtoFieldNames } from './../dtos/delete-notification-dto';
import { authMid, getUIDAccessVerificationMid } from './../middlewares/authentication-middleware';
import { validationResultMid } from './../middlewares/validation-result-midleware';
import { StatusCode } from './../utils/status-code';
import * as express from 'express';
import * as admin from 'firebase-admin';
import { NotificationsModel } from '../models/notification-model';
import { deleteNotificationValidator } from '../validators/delete-notification-validator';

const NOTIFICATION_SEGMENT = '/notification';

const notificationController = express.Router()

const deleteNotificationAction: express.RequestHandler<{}, any, DeleteNotificationDto> = async (req, res) => {
  const { sourceUserId, targetUserId, createdAt, type } = req.body;
  const firestore = admin.firestore();

  const docRef = firestore.doc(`notifications/${sourceUserId}`);

  await firestore.runTransaction(async (transaction) => {
    const docSnap = await transaction.get(docRef);

    if (!docSnap.exists) {
      res.status(StatusCode.conflict).end();
      return;
    }

    const notifications = (docSnap.data() as NotificationsModel).notifications;

    const indexOfNotification = notifications
      .findIndex((ntf) => ntf.uid === targetUserId && ntf.createdAt == createdAt && ntf.type === type);

    if (indexOfNotification === -1) {
      res.status(StatusCode.conflict).end();
      return;
    }

    notifications.splice(indexOfNotification, 1);

    const newNotificationsData: NotificationsModel = {
      size: notifications.length,
      notifications: notifications
    };

    transaction.set(docRef, newNotificationsData);
  });

  res.status(StatusCode.ok).end()
}

notificationController.delete(
  NOTIFICATION_SEGMENT,
  deleteNotificationValidator,
  validationResultMid,
  authMid,
  getUIDAccessVerificationMid('body', DeleteNotificationDtoFieldNames.sourceUserId),
  deleteNotificationAction
);

export default notificationController;