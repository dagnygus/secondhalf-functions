export interface LikeDto {
  sourceUserId: string;
  targetUserId: string;
}

export enum LikeDtoFieldNames {
  sourceUserId = 'sourceUserId',
  targetUserId = 'targetUserId',
}