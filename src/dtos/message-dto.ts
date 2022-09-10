export interface MessageDto {
  sourceUserId: string;
  targetUserId: string;
  content: string;
}

export enum MessageDtoFieldNames {
  sourceUserId = 'sourceUserId',
  targetUserId = 'targetUserId',
  content = 'content',
}