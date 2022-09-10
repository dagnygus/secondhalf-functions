import { AddressInfoDtoFieldNames } from './../dtos/address-info-dto';
import { ValidationChain, body } from 'express-validator';

export const addressInfoSanitizor: ValidationChain = body([ 
    AddressInfoDtoFieldNames.city, 
    AddressInfoDtoFieldNames.state, 
    AddressInfoDtoFieldNames.street, 
    AddressInfoDtoFieldNames.country 
]).trim();
