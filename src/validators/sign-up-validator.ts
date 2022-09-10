import { body, ValidationChain } from 'express-validator';
import * as moment from 'moment';
import { SignUpDtoFieldNames } from '../dtos/sign-up-dto';

export const signUpValidator: ValidationChain[] = [
  body(SignUpDtoFieldNames.firstName)
    .exists({ checkFalsy: true })
		.withMessage("First name is required!")
		.isLength({ min: 3 })
		.withMessage("First name must contains minimum 3 characters!")
		.isAlpha()
		.withMessage("First name must contain alphabetic letters!"),
  body(SignUpDtoFieldNames.lastName)
    .exists({ checkFalsy: true })
    .withMessage("Last name is required!")
    .isLength({ min: 3 })
    .withMessage("Last name must contains minimum 3 characters!")
    .isAlpha()
    .withMessage("Last name must contain alphabetic letters!"),
  body(SignUpDtoFieldNames.nickName)
    .exists({ checkFalsy: true })
		.withMessage("Your nick name is required!")
		.isLength({ min: 3 })
		.withMessage("Your nick name must contains minimum 3 characters")
		.isAlphanumeric('en-US', { ignore: /[\s_-]/g })
		.withMessage("Your nick name must contain alphabetic letters!"),
  body(SignUpDtoFieldNames.email)
    .exists({ checkFalsy: true })
		.withMessage("Address E-mail is required!")
		.isEmail()
		.withMessage("Incorect format od E-mail address!"),
  body(SignUpDtoFieldNames.gender)
    .exists({ checkFalsy: true })
    .withMessage("Your gender is required!")
    .matches(/^(male|female)$/)
    .withMessage('Invalid value for gender!'),
  body(SignUpDtoFieldNames.dateOfBirth)
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Date of birth - invalid format! Required format is YYYY-MM-DD.')
    .custom((value) => {
      const momentDate = moment(value, 'YYYY-MM-DD');
      if (momentDate.isSameOrAfter(moment(new Date()).subtract(18, 'years'))) {
        throw new Error('You must be at least 18 years old to hava an accout!');
			}
      return true;
    }),
  body(SignUpDtoFieldNames.password)
    .exists({ checkFalsy: true })
		.withMessage("Password is required!")
		.isLength({ min: 5 })
		.withMessage("Password must contains minimum 5 symbols!"),
  body(SignUpDtoFieldNames.confirmPassword)
    .exists({ checkFalsy: true })
    .withMessage("Password confirmation is required!")
    .isLength({ min: 5 })
    .withMessage("Password confirmation must contains minimum 5 symbols!")
    .custom((value: string, { req }) => {
      const password = req.body[SignUpDtoFieldNames.password];
      if (value !== password) {
        throw new Error("Password confirmation does not match password!");
      }
      return true;
    }),
]