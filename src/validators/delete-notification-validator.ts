import { ReadNotificationDtoFieldNames } from '../dtos/read-notification-dto';
import { body, ValidationChain } from 'express-validator';
import * as moment from 'moment';
import { notificationTypes } from '../models/notification-model';
export const deleteNotificationValidator: ValidationChain[] = [
  body(ReadNotificationDtoFieldNames.sourceUserId)
    .exists({ checkFalsy: true })
    .withMessage('Source user id is required!'),
  body(ReadNotificationDtoFieldNames.targetUserId)
    .exists({ checkFalsy: true })
    .withMessage('Target user id is required!')
    .custom((_, { req }) => {
      const sourceUserId = req.body[ReadNotificationDtoFieldNames.sourceUserId] as string;
      const targetUserId = req.body[ReadNotificationDtoFieldNames.targetUserId] as string;

      if (targetUserId === sourceUserId) {
        throw new Error('Source user id and target user id can not be the same!')
      }

      return true;
    }),
  body(ReadNotificationDtoFieldNames.createdAt)
    .exists({ checkFalsy: true })
    .withMessage('Creation date is required')
    .custom((value) => {
      const momentDate = moment(value);

      if (!momentDate.isValid()) {
        throw new Error('Invalid format of date creation!');
      }

      return true;
  }),
  body(ReadNotificationDtoFieldNames.type)
    .exists({ checkFalsy: true })
    .withMessage('Notification type is required')
    .custom((value) => {
      if (notificationTypes.has(value)) {
        return true
      }

      throw new Error('Invalid notification types');
  })
]