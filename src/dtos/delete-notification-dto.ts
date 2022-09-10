import { NotificationType } from "../models/notification-model";

export interface DeleteNotificationDto {
  sourceUserId: string,
  targetUserId: string,
  createdAt: string,
  type: NotificationType
}

export enum DeleteNotificationDtoFieldNames {
  sourceUserId = 'sourceUserId',
  targetUserId = 'targetUserId',
  createdAt = 'createdAt',
  type = 'type'
}