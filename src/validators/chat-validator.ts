import { CreateChatDtoFiledNames } from './../dtos/create-chat-dto';
import { body, ValidationChain, param } from 'express-validator';

export const chatValidator: ValidationChain[] = [
  body(CreateChatDtoFiledNames.sourceUserId)
    .exists({ checkFalsy: true })
    .withMessage('Source user id is required!'),
  body(CreateChatDtoFiledNames.targetUserId)
    .exists({  checkFalsy: true })
    .withMessage('Target user id is required!')
    .custom((value, { req }) => {
      if (value === req.body[CreateChatDtoFiledNames.targetUserId]) {
        throw new Error('Target user id can not be the same as target user id!')
      }
      return true;
    })
]

export const getChatValidator: ValidationChain = 
  param('chatId')
    .exists({ checkFalsy: true})
    .withMessage('Like id is missing on URL');