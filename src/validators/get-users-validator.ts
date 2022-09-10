import { query,  ValidationChain } from "express-validator";

export const getUsersValidator: ValidationChain[] = [
  query(['offset', 'limit'])
  .exists()
  .custom((_, { req }) => {
    
    const limitStr = req.query!.limit;
    const offsetStr = req.query!.offset;
  
    const limit = parseInt(limitStr);
    const offset = parseInt(offsetStr);
  
    if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
      _thorwLimitAndOffsetError(limitStr, offsetStr);
    }
  
    if (offset % limit !== 0) {
      throw new Error('Offset must be a multiplied value of limit!');
    }
  
    return true;
  }),
  query('gender').custom((value) => {

    if (value == null) {
      return true
    }

    if (value === 'male' || value === 'female') {
      return true
    }
    throw new Error(`Invalid value of gender! Sent value: {gender = ${value}}`)
  })
];

function _thorwLimitAndOffsetError(limitStr: string, offsetStr: string) {
  throw new Error(`Invalid value of offset or limit! Sent values: { offset = ${offsetStr}; limit = ${limitStr} }`);
}