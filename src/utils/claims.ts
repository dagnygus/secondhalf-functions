import { CLOUD_VERIFICATION_UUID } from "./contat-strings";
import { UserRecord } from "firebase-functions/v1/auth";

export interface CustomClaims {
  member: boolean;
  moderator: boolean;
  admin: boolean;
  gender: 'male' | 'female';
  CLOUD_VERIFICATION_UUID: string
}

export function getClaims(user: UserRecord): CustomClaims | undefined {
  return user.customClaims as any;
}

export const defaultClaimsForMale: Readonly<CustomClaims> = {
  member: true,
  moderator: false,
  admin: false,
  gender: 'male',
  CLOUD_VERIFICATION_UUID
}

export const defaultClaimsForFemale: Readonly<CustomClaims> = {
  member: true,
  moderator: false,
  admin: false,
  gender: 'female',
  CLOUD_VERIFICATION_UUID
}