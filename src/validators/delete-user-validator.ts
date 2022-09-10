import { body, ValidationChain } from "express-validator";
import { DeleteUserDtoFieldNames } from "../dtos/delete-user-dto";

export const deleteUserValidator: ValidationChain = body(DeleteUserDtoFieldNames.UID)
  .exists({ checkFalsy: true })
  .withMessage('User id is required');