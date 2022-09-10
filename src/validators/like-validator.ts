import { LikeDtoFieldNames } from './../dtos/like-dto';
import { body, ValidationChain, param } from 'express-validator';

export const likeValidator: ValidationChain[] = [
  body(LikeDtoFieldNames.sourceUserId)
    .exists({ checkFalsy: true })
    .withMessage('Source user id is required!'),
  body(LikeDtoFieldNames.targetUserId)
    .exists({  checkFalsy: true })
    .withMessage('Target user id is required!')
    .custom((value, { req }) => {
      if (value === req.body[LikeDtoFieldNames.sourceUserId]) {
        throw new Error('Source user id can not be the same as target user id!')
      }
      return true;
    })
]

export const getLikeValidator: ValidationChain = 
  param('likeId')
    .exists({ checkFalsy: true})
    .withMessage('Like id is missing on URL');