import { Request } from 'express';

export enum StatusCode {
  ok = 200,
  created = 201,
  accepted = 202,
  noContent = 204,
  resetContent = 205,
  partialContet = 206,
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  conflict = 409,
  unprocessableEntity = 422,
  internalServerError = 500
}

export enum StatusStr {
  ok = 'ok',
  created = 'created',
  accepted = 'accepted',
  noContent = 'no-content',
  resetContent = 'reset-content',
  partialContet = 'partial-contet',
  badRequest = 'bad-request',
  unauthorized = 'unauthorized',
  forbidden = 'forbidden',
  notFound = 'not-found',
  conflict = 'conflict',
  unprocessableEntity = 'unprocessable-entity',
  internalServerError = 'internal-server-error'
}

export function createdLocalization(req: Request, fragment?: string): string {
  return `${process.env['FUNCTION_SIGNATURE_TYPE']}://${req.header('host')}/${process.env['GCLOUD_PROJECT']}/${process.env['FUNCTION_REGION'] || 'us-central1'}/${process.env['FUNCTION_TARGET']}/${fragment}`;
}

export enum GrpcStatusCode {
  ok = 0,
  canceled = 1,
  unknown = 2,
  invalidArgument = 3,
  deadline_exceeded = 4,
  notFound = 5,
  alreadyExists = 6,
  permisionDenied = 7,
  resourceExhausted = 8,
  failedPrediction = 9,
  aborted = 10,
  outOfRange = 11,
  unimplemented = 12,
  internal = 13,
  unavailable = 14,
  dataLoss = 15,
  unauthenticated = 16,
}