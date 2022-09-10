import { MessageDtoFieldNames } from './../dtos/message-dto';
import { body, ValidationChain } from "express-validator";

export const messageValidator: ValidationChain[] = [
  body(MessageDtoFieldNames.sourceUserId)
    .exists({ checkFalsy: true })
    .withMessage('Source user id is required!'),
  body(MessageDtoFieldNames.targetUserId)
    .exists({ checkFalsy: true})
    .withMessage('Target user id is required!'),
  body(MessageDtoFieldNames.content)
    .exists()
    .withMessage('Message content is required!')
    .isString()
    .withMessage('Incorect type of message content! Content must be of type string')
    .isLength({ min: 1 })
    .withMessage('Message content is required!')
]