export interface AddressInfoDto {
  userId: string
  city: string;
  street: string;
  state: string;
  country: string;
}

export enum AddressInfoDtoFieldNames {
  userId = 'userId',
  city = 'city',
  street = 'street',
  state = 'state',
  country = 'country'
}