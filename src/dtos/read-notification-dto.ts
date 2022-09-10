import { NotificationType } from "../models/notification-model";

export interface ReadNotificationDto {
  sourceUserId: string,
  targetUserId: string,
  createdAt: string,
  type: NotificationType
}

export enum ReadNotificationDtoFieldNames {
  sourceUserId = 'sourceUserId',
  targetUserId = 'targetUserId',
  createdAt = 'createdAt',
  type = 'type'
}