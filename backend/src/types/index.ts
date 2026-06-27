import { Request } from 'express';

// ─── Role Enum ────────────────────────────────────────────────────────────────
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  WARDEN = 'WARDEN',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  TRUSTEE = 'TRUSTEE',
  ACCOUNTANT = 'ACCOUNTANT',
  LAUNDRY_STAFF = 'LAUNDRY_STAFF',
}

// ─── Token Payloads ───────────────────────────────────────────────────────────
export interface AccessTokenPayload {
  sub: string;        // userId
  role: Role;
  hostelId?: string;  // optional: scopes permissions to a specific hostel
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;        // unique token ID (for rotation / revocation)
  iat: number;
  exp: number;
}

// ─── Authenticated Request ────────────────────────────────────────────────────
export interface AuthenticatedUser {
  userId: string;
  role: Role;
  hostelId?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  requestId: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ─── API Response Envelope ────────────────────────────────────────────────────
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  requestId?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  errorCode: string;
  message: string;
  details?: Array<{ field: string; message: string; value?: unknown }>;
  requestId?: string;
  timestamp: string;
  stack?: string; // only in development
}

// ─── Service Response ─────────────────────────────────────────────────────────
export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; statusCode?: number };

// ─── Upload ───────────────────────────────────────────────────────────────────
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  filename: string;
  path: string;
}

// ─── Audit ───────────────────────────────────────────────────────────────────
export interface AuditContext {
  userId: string;
  role: Role;
  ipAddress: string;
  userAgent?: string;
}
