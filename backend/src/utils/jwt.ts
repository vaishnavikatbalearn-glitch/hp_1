import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { AppError, ErrorCode } from '../types/errors';
import type { AccessTokenPayload, RefreshTokenPayload, Role } from '../types';

// ─── Token Generation ─────────────────────────────────────────────────────────

/**
 * Sign a short-lived access token (15 min by default).
 */
export function signAccessToken(payload: {
  userId: string;
  role: Role;
  hostelId?: string;
}): string {
  const data: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
    sub: payload.userId,
    role: payload.role,
    ...(payload.hostelId ? { hostelId: payload.hostelId } : {}),
  };

  return jwt.sign(data, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: env.APP_NAME,
    audience: 'hostelpaglu-client',
  } as jwt.SignOptions);
}

/**
 * Sign a long-lived refresh token (7 days by default).
 * Each token gets a unique JTI so it can be revoked individually.
 */
export function signRefreshToken(userId: string): { token: string; jti: string } {
  const jti = uuidv4();
  const data: Omit<RefreshTokenPayload, 'iat' | 'exp'> = { sub: userId, jti };

  const token = jwt.sign(data, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: env.APP_NAME,
  } as jwt.SignOptions);

  return { token, jti };
}

// ─── Token Verification ───────────────────────────────────────────────────────

/**
 * Verify and decode an access token.
 * Throws an AppError on failure (expired / invalid / missing).
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: env.APP_NAME,
      audience: 'hostelpaglu-client',
    }) as AccessTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Access token expired', ErrorCode.TOKEN_EXPIRED);
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized('Invalid access token', ErrorCode.TOKEN_INVALID);
    }
    throw AppError.unauthorized('Token verification failed', ErrorCode.TOKEN_INVALID);
  }
}

/**
 * Verify and decode a refresh token.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: env.APP_NAME,
    }) as RefreshTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Refresh token expired', ErrorCode.REFRESH_TOKEN_INVALID);
    }
    throw AppError.unauthorized('Invalid refresh token', ErrorCode.REFRESH_TOKEN_INVALID);
  }
}

/**
 * Extract the Bearer token from an Authorization header.
 * Returns null if not present or malformed.
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * Decode a token WITHOUT verifying — useful for reading claims from an
 * expired token (e.g. to log the user ID on the way out).
 */
export function decodeToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.decode(token) as AccessTokenPayload | null;
  } catch {
    return null;
  }
}
