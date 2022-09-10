export interface UserModel {
  userId: string
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  gender: string;
	aboutMySelf?: string;
	dateOfBirth: string;
  isActive: boolean;
  createdAt: string;
  mainPhotoUrl?: string | null,
  city?: string | null,
  street?: string | null,
  state?: string | null,
  country?: string | null
}

export enum UserModelFieldNames {
  userId = 'userId',
  firstName = 'firstName',
  lastName = 'lastName',
  nickname = 'nickname',
  gender = 'gender',
  email = 'email',
  aboutMySelf = 'aboutMySelf',
  dateOfBirth = 'dateOfBirth',
  isActive = 'isActive',
  mainPhotoUrl = 'mainPhotoUrl',
  createdAt = 'createdAt',
  city = 'city',
  street = 'street',
  state = 'state',
  country = 'country',
}