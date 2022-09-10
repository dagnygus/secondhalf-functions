export interface CreateChatDto {
  sourceUserId: string;
  targetUserId: string;
}

export enum CreateChatDtoFiledNames {
  sourceUserId = 'sourceUserId',
  targetUserId = 'targetUserId'
}