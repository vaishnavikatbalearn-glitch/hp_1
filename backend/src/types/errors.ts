import { StatusCodes } from 'http-status-codes';

// ─── Error Codes ──────────────────────────────────────────────────────────────
export enum ErrorCode {
  // Generic
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Auth
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_MISSING = 'TOKEN_MISSING',
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Resources
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  STUDENT_NOT_FOUND = 'STUDENT_NOT_FOUND',
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  HOSTEL_NOT_FOUND = 'HOSTEL_NOT_FOUND',

  // Business Logic
  ROOM_FULL = 'ROOM_FULL',
  LEAVE_OVERLAP = 'LEAVE_OVERLAP',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

// ─── Validation Error Detail ──────────────────────────────────────────────────
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

// ─── AppError ─────────────────────────────────────────────────────────────────
/**
 * Base application error. All thrown errors should use or extend this class.
 * Carries an HTTP status code, a machine-readable error code, and optional
 * structured field-level validation details.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: ValidationErrorDetail[];
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    details?: ValidationErrorDetail[],
    isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace (V8 only)
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Static Factory Helpers ──────────────────────────────────────────────────
  static badRequest(message: string, details?: ValidationErrorDetail[]): AppError {
    return new AppError(message, StatusCodes.BAD_REQUEST, ErrorCode.BAD_REQUEST, details);
  }

  static unauthorized(message = 'Unauthorized', code = ErrorCode.UNAUTHORIZED): AppError {
    return new AppError(message, StatusCodes.UNAUTHORIZED, code);
  }

  static forbidden(message = 'Forbidden', code = ErrorCode.FORBIDDEN): AppError {
    return new AppError(message, StatusCodes.FORBIDDEN, code);
  }

  static notFound(resource: string): AppError {
    return new AppError(
      `${resource} not found`,
      StatusCodes.NOT_FOUND,
      ErrorCode.NOT_FOUND,
    );
  }

  static conflict(message: string, code = ErrorCode.CONFLICT): AppError {
    return new AppError(message, StatusCodes.CONFLICT, code);
  }

  static validation(message: string, details: ValidationErrorDetail[]): AppError {
    return new AppError(
      message,
      StatusCodes.UNPROCESSABLE_ENTITY,
      ErrorCode.VALIDATION_ERROR,
      details,
    );
  }

  static tooManyRequests(message = 'Too many requests'): AppError {
    return new AppError(message, StatusCodes.TOO_MANY_REQUESTS, ErrorCode.TOO_MANY_REQUESTS);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(
      message,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_SERVER_ERROR,
      undefined,
      false, // non-operational = programming error
    );
  }
}
