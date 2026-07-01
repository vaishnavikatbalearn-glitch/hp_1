import { Request, Response, NextFunction } from 'express';
// Avoid importing @prisma/client at module load time to prevent import-time
// failures when the generated query engine is missing. Detect Prisma errors
// by shape/name instead.
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { AppError, ErrorCode, ValidationErrorDetail } from '../types/errors';
import { ApiErrorResponse } from '../types';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// ─── 404 Handler ──────────────────────────────────────────────────────────────
/**
 * Catches requests that fall through all route handlers.
 * Must be registered AFTER all routes.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl}`));
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
/**
 * Central error handler. Must be registered as the LAST middleware (4 args).
 *
 * Error classification order:
 *  1. AppError              → operational / known errors
 *  2. ZodError              → validation (should be caught by validate middleware first)
 *  3. Prisma errors         → database-level errors
 *  4. JWT errors            → already converted by jwt.ts, but guard here too
 *  5. Everything else       → 500 Internal Server Error
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Resolve to a structured AppError
  const appError = resolveError(err);

  // Log — include context for debugging
  logError(appError, req);

  // Build response body
  const body: ApiErrorResponse = {
    success: false,
    statusCode: appError.statusCode,
    errorCode: appError.errorCode,
    message: appError.message,
    ...(appError.details ? { details: appError.details } : {}),
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    // Only expose stack traces in development
    ...(env.isDevelopment && appError.stack
      ? { stack: appError.stack }
      : {}),
  };

  res.status(appError.statusCode).json(body);
}

// ─── Error Resolver ───────────────────────────────────────────────────────────
function resolveError(err: unknown): AppError {
  // Already an AppError
  if (err instanceof AppError) return err;

  // Zod validation error (shouldn't reach here normally, but just in case)
  if (err instanceof ZodError) {
    const details: ValidationErrorDetail[] = err.errors.map((e) => ({
      field: e.path.join('.') || 'root',
      message: e.message,
    }));
    return AppError.validation('Validation failed', details);
  }

  // ── Prisma Errors (shape-based detection) ─────────────────────────────────
  const maybePrisma = err as any;
  if (maybePrisma?.name === 'PrismaClientKnownRequestError') {
    return resolvePrismaError(maybePrisma);
  }

  if (maybePrisma?.name === 'PrismaClientValidationError') {
    return AppError.badRequest('Database validation error: invalid data shape');
  }

  if (maybePrisma?.name === 'PrismaClientInitializationError') {
    logger.error('[DB] Prisma initialization failed', { error: maybePrisma.message });
    return new AppError(
      'Database connection failed',
      StatusCodes.SERVICE_UNAVAILABLE,
      ErrorCode.SERVICE_UNAVAILABLE,
      undefined,
      false,
    );
  }

  // ── JWT Errors (raw, if not pre-converted) ─────────────────────────────────
  if (isJwtError(err)) {
    const e = err as Error;
    if (e.name === 'TokenExpiredError') {
      return AppError.unauthorized('Token expired', ErrorCode.TOKEN_EXPIRED);
    }
    return AppError.unauthorized('Invalid token', ErrorCode.TOKEN_INVALID);
  }

  // ── SyntaxError (malformed JSON body) ─────────────────────────────────────
  if (err instanceof SyntaxError && 'body' in err) {
    return AppError.badRequest('Malformed JSON in request body');
  }

  // ── Generic Error ──────────────────────────────────────────────────────────
  if (err instanceof Error) {
    // Non-operational errors — programming bugs, unexpected failures
    return new AppError(
      env.isProduction ? 'Something went wrong' : err.message,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_SERVER_ERROR,
      undefined,
      false,
    );
  }

  return AppError.internal();
}

// ─── Prisma Error Mapping ─────────────────────────────────────────────────────
function resolvePrismaError(err: { code?: string; meta?: Record<string, unknown> }): AppError {
  switch (err.code) {
    case 'P2002': {
      // Unique constraint violation
      const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
      return AppError.conflict(`A record with this ${target} already exists`, ErrorCode.CONFLICT);
    }

    case 'P2003':
      // Foreign key constraint violation
      return AppError.badRequest('Referenced record does not exist');

    case 'P2025':
      // Record not found (e.g. update/delete on non-existent record)
      return AppError.notFound('Record');

    case 'P2016':
      // Query interpretation error
      return AppError.badRequest('Invalid query parameters');

    case 'P2014':
      // Relation violation
      return AppError.badRequest('Relation constraint violated');

    case 'P1001':
      // Cannot reach database
      return new AppError(
        'Database unreachable',
        StatusCodes.SERVICE_UNAVAILABLE,
        ErrorCode.SERVICE_UNAVAILABLE,
        undefined,
        false,
      );

    default:
      logger.error('[DB] Unhandled Prisma error', { code: err.code, meta: err.meta });
      return AppError.internal(`Database error [${err.code}]`);
  }
}

// ─── Logger ──────────────────────────────────────────────────────────────────
function logError(err: AppError, req: Request): void {
  const context = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    statusCode: err.statusCode,
    errorCode: err.errorCode,
    userId: (req as Request & { user?: { userId: string } }).user?.userId,
  };

  if (err.statusCode >= 500) {
    logger.error(`[${err.errorCode}] ${err.message}`, { ...context, stack: err.stack });
  } else if (err.statusCode >= 400) {
    logger.warn(`[${err.errorCode}] ${err.message}`, context);
  } else {
    logger.info(`[${err.errorCode}] ${err.message}`, context);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isJwtError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(err.name);
}
