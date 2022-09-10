export interface PatchUserDto {
  userId: string;
  fieldName: string;
  newValue: string;
}

export enum PatchUserDtoFieldNames {
  userId = 'userId',
  fieldName = 'fieldName',
  newValue = 'newValue'
}