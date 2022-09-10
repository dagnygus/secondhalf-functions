import { MessageModel } from "./message-model";

export interface ChatModel {
  size: number;
  createdAt: string;
  UIDs: string[];
  messages: MessageModel[]
}

export enum ChatModelFieldNames {
  size = 'size',
  createdAt = 'createdAt',
  UIDs = 'UIDs',
  messages = 'messages'
}