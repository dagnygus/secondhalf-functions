import { AddressInfoDtoFieldNames } from './../dtos/address-info-dto';
import { PatchUserDtoFieldNames } from './../dtos/patch-user-dto';
import { oneOf, ValidationChain, body } from 'express-validator';
import { Middleware, Request } from 'express-validator/src/base';
import { Result } from 'express-validator/src/validation-result';
import { SignUpDtoFieldNames } from '../dtos/sign-up-dto';
import * as moment from 'moment';

type PatchUserValidator = (ValidationChain | (Middleware & { run: (req: Request) => Promise<Result> }))[];

export const patchUserValidator: PatchUserValidator = [
  body(PatchUserDtoFieldNames.userId)
    .exists({ checkFalsy: true })
    .withMessage('User id  is required![field name: \'userId\']'),
  body(PatchUserDtoFieldNames.fieldName)
    .exists({ checkFalsy: true })
    .withMessage('Field \'fieldName\' is required!'),
  oneOf([
    [
      body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.firstName),
      body(PatchUserDtoFieldNames.newValue)
        .exists({ checkFalsy: true })
        .withMessage("First name is required!")
        .isLength({ min: 3 })
        .withMessage("First name must contains minimum 3 characters!")
        .isAlpha()
        .withMessage("First name must contain alphabetic letters!"),
    ],
    [
      body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.lastName),
      body(PatchUserDtoFieldNames.newValue)
        .exists({ checkFalsy: true })
        .withMessage("Last name is required!")
        .isLength({ min: 3 })
        .withMessage("Last name must contains minimum 3 characters!")
        .isAlpha()
        .withMessage("Last name must contain alphabetic letters!"),
    ],
    [
      body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.nickName),
      body(PatchUserDtoFieldNames.newValue)
        .exists({ checkFalsy: true })
        .withMessage("Your nick name is required!")
        .isLength({ min: 3 })
        .withMessage("Your nick name must contains minimum 3 characters")
        .isAlphanumeric('en-US', { ignore: /[\s_-]/g })
        .withMessage("Your nick name must contain alphanumeric letters includig white spaces, underscores and dashes!"),
    ],
    [
      body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.email),
      body(PatchUserDtoFieldNames.newValue)
        .exists({ checkFalsy: true })
        .withMessage("Address E-mail is required!")
        .isEmail()
        .withMessage("Incorect format od E-mail address!"),
    ],
    [
      body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.gender),
      body(PatchUserDtoFieldNames.newValue)
        .exists({ checkFalsy: true })
        .withMessage("Your gender is required!")
        .matches(/^(male|female)$/)
        .withMessage('Invalid value for gender!'),
    ],
    [
      body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.dateOfBirth),
      body(PatchUserDtoFieldNames.newValue)
        .isDate({ format: 'DD/MM/YYYY' })
        .withMessage('Date of birth - invalid format! Required format is DD/MM/YYYY.')
        .custom((value) => {
          const momentDate = moment(value, 'DD/MM/YYYY');
          if (momentDate.isSameOrAfter(moment(new Date()).subtract(18, 'years'))) {
            throw new Error('You must be at least 18 years old to hava an accout!');
          }
          return true;
        }),
    ],
    [
      body(PatchUserDtoFieldNames.fieldName).equals(AddressInfoDtoFieldNames.city),
      body(PatchUserDtoFieldNames.newValue)
        .exists({ checkFalsy: true })
        .withMessage('City is required!')
        .isAlpha('en-US', { ignore: /[\s\.-]/g })
        .withMessage('City must contain only alphabetic letters including spaces, dots and dashes!'),
    ],
    [
      body(PatchUserDtoFieldNames.fieldName).equals(AddressInfoDtoFieldNames.street),
      body(PatchUserDtoFieldNames.newValue)
        .exists({ checkFalsy: true })
        .withMessage('Street is required!')
        .isAlphanumeric('en-US', { ignore: /[[\s\.-\/]/g })
        .withMessage('Street must contain only alphanumberic letters including spaces, dots, dashes and slashes!'),
    ],
    [
      body(PatchUserDtoFieldNames.fieldName).equals(AddressInfoDtoFieldNames.state),
      body(PatchUserDtoFieldNames.newValue)
        .exists({ checkFalsy: true })
        .withMessage('State is required!')
        .isAlpha('en-US', { ignore: /[\s\.-]/g })
        .withMessage('State must contain only alphabetic letters including spaces, dots and dashes!'),
    ],
    [
      body(PatchUserDtoFieldNames.fieldName).equals(AddressInfoDtoFieldNames.country),
      body(PatchUserDtoFieldNames.newValue)
        .exists({ checkFalsy: true })
        .withMessage('Country is required!')
        .isAlpha('en-US', { ignore: /[\s]/ })
        .withMessage('Country must contain only alphabetic letters including spaces!'),
    ],
    [
      body(PatchUserDtoFieldNames.fieldName).equals(SignUpDtoFieldNames.aboutMySelf),
      body(PatchUserDtoFieldNames.newValue)
        .exists({ checkFalsy: true })
        .withMessage('About youre self description is required!')
    ]
  ])
]