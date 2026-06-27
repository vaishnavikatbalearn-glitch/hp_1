import { Request, Response, NextFunction } from 'express';
import { extractBearerToken, verifyAccessToken } from '../utils/jwt';
import { AppError, ErrorCode } from '../types/errors';
import type { AuthenticatedRequest } from '../types';

// ─── Authentication Middleware ────────────────────────────────────────────────
/**
 * Validates the JWT access token in the Authorization header and attaches
 * the decoded user to `req.user`.
 *
 * Throws 401 if:
 *  - No Authorization header is present
 *  - Token is malformed / invalid
 *  - Token is expired
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next(
      AppError.unauthorized('No access token provided', ErrorCode.TOKEN_MISSING),
    );
  }

  try {
    const payload = verifyAccessToken(token);

    (req as AuthenticatedRequest).user = {
      userId: payload.sub,
      role: payload.role,
      ...(payload.hostelId ? { hostelId: payload.hostelId } : {}),
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication — attaches user if token is present and valid,
 * but does NOT block the request if the token is missing.
 * Useful for endpoints that work for both guests and authenticated users.
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = {
      userId: payload.sub,
      role: payload.role,
      ...(payload.hostelId ? { hostelId: payload.hostelId } : {}),
    };
  } catch {
    // Silently ignore; user stays undefined
  }

  next();
}
