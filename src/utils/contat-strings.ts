import { StatusStr } from "./status-code";

export const CLOUD_VERIFICATION_UUID = '35b19fa8-830e-463e-b9fc-6167a7e18bb9';
export const UNAUTH_MSG = 'Unauthorized user tried to reach secured endpoint!';
export const UNAUTH_ACTION_MSG = 'Unauthorized user tried to perform a secured action!';
export const USER_NOT_FOUND = 'auth/user-not-found';
export const EMAIL_ALREADY_EXIST = 'auth/email-already-exist';
export const INTERNAL_SERVER_ERROR_MSG = 'An internal error occurred while attempting to perform this action!';
export const NOT_FOUND_MSG = 'Resource not found!';
export const LOCALIZATION_HEADER = 'Localization';
export const CONFLICT_MSG = 'Resource allready exists!'
export const USERS_METADATA_DOC_PATH = 'db_info/users_metadata';
export const PAGINATION_TOTAL_USERS = 'PAGINATION-TOTAL-USERS';
export const PAGINATION_TOTAL_PAGES = 'PAGINATION-TOTAL-PAGES';

type StatusData = Readonly<{ code: string, message: string }>

export const internalServerErrorStatusData: StatusData = {
  code: StatusStr.internalServerError,
  message: INTERNAL_SERVER_ERROR_MSG
};

export const forbiddenStatusData: StatusData = {
  message: UNAUTH_ACTION_MSG,
  code: StatusStr.forbidden
};

export const unauthorizedStatusData: StatusData = {
  code: StatusStr.unauthorized,
  message: UNAUTH_MSG
};

export const notFoundStatusData: StatusData = {
  code: StatusStr.notFound,
  message: NOT_FOUND_MSG
};

export const conflictStatusData: StatusData = {
  code: StatusStr.conflict,
  message: CONFLICT_MSG
};