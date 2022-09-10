import { AddressInfoDtoFieldNames } from './../dtos/address-info-dto';
import { body, ValidationChain } from "express-validator";

export const addressInfoValidator: ValidationChain[] = [
  body(AddressInfoDtoFieldNames.userId)
    .exists({ checkFalsy: true})
    .withMessage('User id is required!'),
  body(AddressInfoDtoFieldNames.city)
    .exists({ checkFalsy: true })
    .withMessage('City is required!')
    .isAlpha('en-US', { ignore: /[\s\.-]/g })
    .withMessage('City must contain only alphabetic letters including spaces, dots and dashes!'),
  body(AddressInfoDtoFieldNames.street)
    .exists({ checkFalsy: true })
    .withMessage('Street is required!')
    .isAlphanumeric('en-US', { ignore: /[\s\.-\/]/g })
    .withMessage('Street must contain only alphanumberic letters including spaces, dots, dashes and slashes!'),
  body(AddressInfoDtoFieldNames.state)
    .exists({ checkFalsy: true })
    .withMessage('State is required!')
    .isAlpha('en-US', { ignore: /[\s\.-]/g })
    .withMessage('State must contain only alphabetic letters including spaces, dots and dashes!'),
  body(AddressInfoDtoFieldNames.country)
    .exists({ checkFalsy: true })
    .withMessage('Country is required!')
    .isAlpha('en-US', { ignore: /[\s]/g })
    .withMessage('Country must contain only alphabetic letters including spaces!'),
]