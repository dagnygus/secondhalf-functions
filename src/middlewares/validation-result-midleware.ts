import { UserModelFieldNames } from './../models/user-model';
import { StatusCode, StatusStr } from '../utils/status-code';
import { validationResult } from 'express-validator';
import { RequestHandler } from 'express'

const getValidationResultErrors = validationResult.withDefaults({ 
  formatter(error) {
    if (error.param === 'password' || error.param == 'confirmPassword') {
      return {
        msg: error.msg,
        param: error.param,
        location: error.location,
        value: error.value
      };
    }
    return error;
  }
});

export const validationResultMid: RequestHandler = (req, res, next) => {

  if (req.body.fieldName === UserModelFieldNames.mainPhotoUrl) {
    if (!req.body.newValue) {
      const errorResult = {
        msg: 'File url is required!',
        param: 'fieldName',
        location: 'body',
        value: req.body.newValue
      };

      const error = {
        code: StatusStr.unprocessableEntity,
        data: [ errorResult ]
      }

      res.status(StatusCode.unprocessableEntity).json(error);
      return
    }

    if (typeof req.body.newValue !== 'string') {
      const errorResult = {
        msg: 'Invalid type of url!',
        param: 'fieldName',
        location: 'body',
        value: req.body.newValue
      };

      const error = {
        code: StatusStr.unprocessableEntity,
        data: [ errorResult ]
      }

      res.status(StatusCode.unprocessableEntity).json(error);
      return
    }

    next();
    return;
  }
  
  const result = getValidationResultErrors(req);
  
  if (!result.isEmpty()) {
    const error = {
      code: StatusStr.unprocessableEntity,
      data: result.array()
    };
    res.status(StatusCode.unprocessableEntity).json(error);
    return;
  }

  next();
}