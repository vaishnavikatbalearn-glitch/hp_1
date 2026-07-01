import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../auth/types';

const LOGIN_PATH = '/login';
const DEFAULT_UNAUTHORIZED_PATH = '/unauthorized';

interface RoleBasedRouteProps {
  allowedRoles: Array<Role | string>;
  /** Where to send an authenticated user who lacks a required role. Defaults to /unauthorized. */
  redirectTo?: string;
}

function normalizeRole(role: Role | string | null | undefined): string | null {
  if (!role) {
    return null;
  }

  const normalized = role.trim().toUpperCase();

  switch (normalized) {
    case 'SUPERADMIN':
    case 'ADMIN':
      return 'ADMIN';
    case 'MANAGER':
    case 'MODERATOR':
      return 'MANAGER';
    case 'USER':
    case 'STUDENT':
    case 'PARENT':
    case 'WARDEN':
    case 'ACCOUNTANT':
    case 'TRUSTEE':
    case 'LAUNDRY':
      return normalized;
    default:
      return normalized;
  }
}

function isAllowedRole(userRole: Role | string | null | undefined, allowedRoles: Array<Role | string>): boolean {
  const normalizedUserRole = normalizeRole(userRole);
  if (!normalizedUserRole) {
    return false;
  }

  return allowedRoles.some((role) => normalizeRole(role) === normalizedUserRole);
}

/**
 * Use for routes restricted to specific roles, e.g.:
 *   <Route element={<RoleBasedRoute allowedRoles={['ADMIN']} />}>
 *     <Route path="/admin" element={<AdminPanelScreen />} />
 *   </Route>
 *
 * Unauthenticated users are sent to /login; authenticated users with the
 * wrong role are sent to redirectTo (so they get a clear "not allowed"
 * message rather than being silently bounced to /login).
 */
export function RoleBasedRoute({ allowedRoles, redirectTo = DEFAULT_UNAUTHORIZED_PATH }: RoleBasedRouteProps) {
  const { user, isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div role="status" aria-live="polite">
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location }} />;
  }

  if (!isAllowedRole(user.role, allowedRoles)) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
