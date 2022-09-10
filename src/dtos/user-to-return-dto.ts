import { UserModel } from "../models/user-model";

export interface UserToReturnDto extends UserModel {
  userId: string;
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
  liked?: boolean;
  city?: string | null;
  street?: string | null;
  state?: string | null;
  country?: string | null;
}