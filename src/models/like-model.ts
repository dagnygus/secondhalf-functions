export interface LikeModel {
  sourceUserId: string;
  targetUserId: string;
  createdAt: string;
}

export enum LikeModelFieldNames {
  createdAt = 'createdAt',
  sourceUserId = 'sourceUserId',
  targetUserId = 'targetUserId'
}