import { unauthorizedStatusData, internalServerErrorStatusData, forbiddenStatusData } from './../utils/contat-strings';
import { StatusCode } from '../utils/status-code';
import { RequestHandler, Request } from 'express';
import * as admin from 'firebase-admin';
import { getClaims } from '../utils/claims';

type DecodedToken = { decodedToken: admin.auth.DecodedIdToken };

export function isUserAuthenticated(req: Request) {
  return typeof (req as any as DecodedToken).decodedToken !== 'undefined';
}

export function getAuthUserId(req: Request) {
  return (req as any as DecodedToken).decodedToken.uid;
}

export function getAuthUserEmail(req: Request): string {
  return (req as any as DecodedToken).decodedToken.email!;
}

export async function hasAdminAccessPolicy(uid: string): Promise<boolean> {
  const user = await admin.auth().getUser(uid)
  const claims = getClaims(user);

  if (!claims) return false;

  return claims.admin
}

export async function hasModeratorAccessPolicy(uid: string): Promise<boolean> {
  const user = await admin.auth().getUser(uid)
  const claims = getClaims(user);

  if (!claims) return false;

  return claims.moderator || claims.admin;
}

export const authMid: RequestHandler = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(StatusCode.unauthorized).json(unauthorizedStatusData);
    return;
  }

  const token = req.headers.authorization.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).decodedToken = decodedToken;
  } catch {
    res.status(StatusCode.unauthorized).json(unauthorizedStatusData);
    return;
  }
  next();
}

export const optionalAuthMid: RequestHandler = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      (req as any as DecodedToken).decodedToken = await admin.auth().verifyIdToken(token);
    } catch {
      next()
    }
  }
  next();
}

export const moderatorPolicyMid: RequestHandler = async (req, res, next) => {
  if (!isUserAuthenticated(req)) {
    res.json(StatusCode.unauthorized).json(unauthorizedStatusData);
    return;
  }

  const uid = getAuthUserId(req);

  try {
    if (await hasModeratorAccessPolicy(uid)) {
      next();
      return
    }

    res.json(StatusCode.forbidden).json(forbiddenStatusData);
  } catch {
    res.status(StatusCode.internalServerError).json(internalServerErrorStatusData)
  }
}

export const adminPolicyMid: RequestHandler = async (req, res, next) => {
  if (!isUserAuthenticated(req)) {
    res.json(StatusCode.unauthorized).json(unauthorizedStatusData);
    return;
  }

  const uid = getAuthUserId(req);

  try {
    if (await hasAdminAccessPolicy(uid)) {
      next();
      return
    }

    res.json(StatusCode.forbidden).json(forbiddenStatusData);
  } catch {
    res.status(StatusCode.internalServerError).json(internalServerErrorStatusData)
  }
}

export function getUIDAccessVerificationMid(target: 'body' | 'query' | 'params', mapedId: string, policy?: 'admin' | 'moderator'): RequestHandler {
  return async (req, res, next) => {
    const uid = getAuthUserId(req);

    if (uid == req[target][mapedId]) {
      next();
      return;
    }

    try {
      if (policy) {
        if (policy === 'moderator' && await hasModeratorAccessPolicy(uid)) {
          next();
          return;
        }
        if (policy === 'admin' && await hasAdminAccessPolicy(uid)) {
          next();
          return;
        }
      }
    } catch {
      res.status(StatusCode.internalServerError).json(internalServerErrorStatusData)
    }
    
    res.status(StatusCode.forbidden).json(forbiddenStatusData);
  }
}