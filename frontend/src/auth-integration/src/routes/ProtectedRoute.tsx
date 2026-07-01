import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const LOGIN_PATH = '/login';

/**
 * Wrap a <Route> with this as the element, then nest the protected
 * routes inside it (see app/routes.config.tsx). Renders <Outlet />
 * (the matched child route) only once authenticated.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div role="status" aria-live="polite">
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
