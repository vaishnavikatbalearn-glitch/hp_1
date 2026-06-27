import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../auth/types';

interface RoleBasedRouteProps {
  allowedRoles: Role[];
  /** Where to send an authenticated user who lacks a required role. Defaults to /unauthorized. */
  redirectTo?: string;
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
export function RoleBasedRoute({ allowedRoles, redirectTo = '/unauthorized' }: RoleBasedRouteProps) {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div role="status" aria-live="polite">
        Loading session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
