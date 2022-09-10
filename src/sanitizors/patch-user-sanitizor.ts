import { AddressInfoDtoFieldNames } from './../dtos/address-info-dto';
import { PatchUserDtoFieldNames } from './../dtos/patch-user-dto';
import { oneOf, body } from 'express-validator';
import { SignUpDtoFieldNames } from '../dtos/sign-up-dto';

export const patchUserSanitizor = oneOf([
  [
    body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.firstName),
    body(PatchUserDtoFieldNames.newValue)
      .customSanitizer((value: string) => value[0].toUpperCase() + value.slice(1).toLowerCase()),
  ],
  [
    body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.lastName),
    body(PatchUserDtoFieldNames.newValue)
      .customSanitizer((value: string) => value[0].toUpperCase() + value.slice(1).toLowerCase()),
  ],
  [
    body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.email),
    body(PatchUserDtoFieldNames.newValue).trim()
  ],
  [
    body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.nickName),
    body(PatchUserDtoFieldNames.newValue).trim()
  ],
  [
    body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.aboutMySelf),
    body(PatchUserDtoFieldNames.newValue).trim()
  ],
  [
    body(PatchUserDtoFieldNames.fieldName).equals(AddressInfoDtoFieldNames.city),
    body(PatchUserDtoFieldNames.newValue).trim()
  ],
  [
    body(PatchUserDtoFieldNames.fieldName).equals(AddressInfoDtoFieldNames.street),
    body(PatchUserDtoFieldNames.newValue).trim()
  ],
  [
    body(PatchUserDtoFieldNames.fieldName).equals(AddressInfoDtoFieldNames.state),
    body(PatchUserDtoFieldNames.newValue).trim()
  ],
  [
    body(PatchUserDtoFieldNames.fieldName).equals(AddressInfoDtoFieldNames.country),
    body(PatchUserDtoFieldNames.newValue).trim()
  ],
])