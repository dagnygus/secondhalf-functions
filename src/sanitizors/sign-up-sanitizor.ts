import { SignUpDtoFieldNames } from './../dtos/sign-up-dto';
import { body, ValidationChain } from 'express-validator';
export const signUpSanitizor: ValidationChain[] = [
  body([SignUpDtoFieldNames.firstName, SignUpDtoFieldNames.lastName])
    .customSanitizer((value: string) => value[0].toUpperCase() + value.slice(1).toLowerCase()),
  body([SignUpDtoFieldNames.email, SignUpDtoFieldNames.aboutMySelf, SignUpDtoFieldNames.nickName])
    .trim()
]