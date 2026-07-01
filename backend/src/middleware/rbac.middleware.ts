import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Role } from '../types';
import { AppError, ErrorCode } from '../types/errors';
import type { AuthenticatedRequest } from '../types';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('RBAC');

// ─── Permission Map ───────────────────────────────────────────────────────────
/**
 * Defines which roles are allowed to perform each named action.
 * Add new permissions here as the system grows.
 *
 * Convention: resource:action  (e.g. "student:read", "leave:approve")
 */
export const PERMISSIONS: Record<string, Role[]> = {
  // ── User Management ─────────────────────────────────────────────────────────
  'user:create': [Role.SUPER_ADMIN, Role.ADMIN],
  'user:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN],
  'user:update': [Role.SUPER_ADMIN, Role.ADMIN],
  'user:delete': [Role.SUPER_ADMIN],

  // ── Hostel Management ───────────────────────────────────────────────────────
  'hostel:create': [Role.SUPER_ADMIN],
  'hostel:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.TRUSTEE],
  'hostel:update': [Role.SUPER_ADMIN, Role.ADMIN],
  'hostel:delete': [Role.SUPER_ADMIN],

  // ── Student Management ──────────────────────────────────────────────────────
  'student:create': [Role.SUPER_ADMIN, Role.ADMIN],
  'student:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN, Role.PARENT, Role.STUDENT],
  'student:update': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN],
  'student:delete': [Role.SUPER_ADMIN, Role.ADMIN],

  // ── Room Management ─────────────────────────────────────────────────────────
  'room:create': [Role.SUPER_ADMIN, Role.ADMIN],
  'room:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN, Role.STUDENT],
  'room:update': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN],
  'room:allocate': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN],

  // ── Attendance ──────────────────────────────────────────────────────────────
  'attendance:mark': [Role.WARDEN, Role.ADMIN],
  'attendance:read': [
    Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN, Role.STUDENT, Role.PARENT, Role.TRUSTEE,
  ],
  'attendance:report': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN, Role.TRUSTEE],

  // ── Leave Management ────────────────────────────────────────────────────────
  'leave:create': [Role.STUDENT],
  'leave:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN, Role.STUDENT, Role.PARENT],
  'leave:approve': [Role.WARDEN, Role.ADMIN],
  'leave:reject': [Role.WARDEN, Role.ADMIN],

  // ── Fees & Finance ──────────────────────────────────────────────────────────
  'fees:create': [Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT],
  'fees:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT, Role.TRUSTEE, Role.STUDENT, Role.PARENT],
  'fees:update': [Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT],
  'fees:delete': [Role.SUPER_ADMIN],
  'fees:report': [Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT, Role.TRUSTEE],

  // ── Fines ───────────────────────────────────────────────────────────────────
  'fine:create': [Role.WARDEN, Role.ADMIN],
  'fine:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN, Role.STUDENT, Role.PARENT],
  'fine:update': [Role.ADMIN, Role.SUPER_ADMIN],

  // ── Maintenance ─────────────────────────────────────────────────────────────
  'maintenance:create': [Role.STUDENT, Role.WARDEN],
  'maintenance:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN],
  'maintenance:update': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN],

  // ── Complaints ───────────────────────────────────────────────────────────
  'complaint:create': [Role.STUDENT],
  'complaint:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN, Role.STUDENT],
  'complaint:update': [Role.WARDEN, Role.ADMIN],

  // ── Laundry ─────────────────────────────────────────────────────────────────
  'laundry:create': [Role.STUDENT],
  'laundry:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN, Role.LAUNDRY_STAFF, Role.STUDENT],
  'laundry:update': [Role.LAUNDRY_STAFF, Role.ADMIN],

  // ── Notices ─────────────────────────────────────────────────────────────────
  'notice:create': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN],
  'notice:read': [
    Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN, Role.STUDENT, Role.PARENT, Role.TRUSTEE,
  ],
  'notice:update': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN],
  'notice:delete': [Role.SUPER_ADMIN, Role.ADMIN],

  // ── Reports ─────────────────────────────────────────────────────────────────
  'report:generate': [Role.SUPER_ADMIN, Role.ADMIN, Role.TRUSTEE, Role.ACCOUNTANT],
  'report:export': [Role.SUPER_ADMIN, Role.ADMIN, Role.TRUSTEE],

  // ── Visitor ─────────────────────────────────────────────────────────────────
  'visitor:create': [Role.STUDENT, Role.PARENT],
  'visitor:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.WARDEN, Role.STUDENT],
  'visitor:approve': [Role.WARDEN, Role.ADMIN],
  'visitor:reject': [Role.WARDEN, Role.ADMIN],

  // ── Analytics / Dashboard ───────────────────────────────────────────────────
  'analytics:read': [Role.SUPER_ADMIN, Role.ADMIN, Role.TRUSTEE],
  'analytics:full': [Role.SUPER_ADMIN],
} as const;

// ─── RBAC Middleware ──────────────────────────────────────────────────────────

/**
 * Restricts a route to users whose role is in the provided list.
 *
 * Must be used AFTER `authenticate` middleware.
 *
 * @example
 * router.delete('/users/:id', authenticate, requireRoles(Role.SUPER_ADMIN), handler);
 */
export function requireRoles(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return next(AppError.unauthorized());
    }

    if (!roles.includes(authReq.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${authReq.user.role}`,
        ),
      );
    }

    next();
  };
}

/**
 * Restricts a route based on a named permission key.
 *
 * Must be used AFTER `authenticate` middleware.
 *
 * @example
 * router.get('/attendance', authenticate, requirePermission('attendance:read'), handler);
 */
export function requirePermission(permission: string): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return next(AppError.unauthorized());
    }

    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles) {
      log.warn(`Unknown permission key: "${permission}"`);
      return next(
        AppError.forbidden(
          `Unknown permission: ${permission}`,
          ErrorCode.INSUFFICIENT_PERMISSIONS,
        ),
      );
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return next(
        AppError.forbidden(
          `Permission denied: "${permission}" requires one of [${allowedRoles.join(', ')}]`,
          ErrorCode.INSUFFICIENT_PERMISSIONS,
        ),
      );
    }

    next();
  };
}

/**
 * Allows a user to access their own resource, OR any role in the provided list.
 *
 * @example
 * // Students can read their own profile; admins/wardens can read any
 * router.get('/students/:id', authenticate, requireSelfOrRoles('userId', Role.ADMIN, Role.WARDEN), handler);
 */
export function requireSelfOrRoles(
  userIdParam: string,
  ...allowedRoles: Role[]
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return next(AppError.unauthorized());
    }

    const targetId = req.params[userIdParam] ?? req.body[userIdParam];
    const isSelf = authReq.user.userId === targetId;
    const hasRole = allowedRoles.includes(authReq.user.role);

    if (!isSelf && !hasRole) {
      return next(AppError.forbidden());
    }

    next();
  };
}

/**
 * Super-admin gate — shorthand for `requireRoles(Role.SUPER_ADMIN)`.
 */
export const requireSuperAdmin: RequestHandler = requireRoles(Role.SUPER_ADMIN);

/**
 * Admin or above — shorthand for `requireRoles(Role.SUPER_ADMIN, Role.ADMIN)`.
 */
export const requireAdmin: RequestHandler = requireRoles(Role.SUPER_ADMIN, Role.ADMIN);

/**
 * Warden or above.
 */
export const requireWarden: RequestHandler = requireRoles(
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.WARDEN,
);
