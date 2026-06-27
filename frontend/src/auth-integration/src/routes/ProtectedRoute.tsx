import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * Wrap a <Route> with this as the element, then nest the protected
 * routes inside it (see app/routes.config.tsx). Renders <Outlet />
 * (the matched child route) only once authenticated.
 *
 * Swap the loading div below for your own existing spinner/skeleton
 * component if you have one — this does not introduce new UI, just
 * a placeholder for the bootstrap loading state.
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
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
