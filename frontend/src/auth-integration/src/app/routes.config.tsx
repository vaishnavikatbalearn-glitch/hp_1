import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { RoleBasedRoute } from '../routes/RoleBasedRoute';
import { LoginScreenContainer } from '../screens-integration/LoginScreenContainer';
import { RegisterScreenContainer } from '../screens-integration/RegisterScreenContainer';

// Import your existing, completely untouched screens here, e.g.:
// import { DashboardScreen } from '../../screens/DashboardScreen';
// import { AdminPanelScreen } from '../../screens/AdminPanelScreen';
// import { UnauthorizedScreen } from '../../screens/UnauthorizedScreen';

/**
 * Replace your current top-level <Routes> with this structure (or merge
 * it in) — it only adds guards around route elements, it does not change
 * any screen component.
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginScreenContainer />} />
      <Route path="/register" element={<RegisterScreenContainer />} />
      {/* <Route path="/unauthorized" element={<UnauthorizedScreen />} /> */}

      {/* Authenticated — any logged-in role */}
      <Route element={<ProtectedRoute />}>
        {/* <Route path="/dashboard" element={<DashboardScreen />} /> */}
      </Route>

      {/* Authenticated — restricted to specific roles */}
      <Route element={<RoleBasedRoute allowedRoles={['ADMIN']} />}>
        {/* <Route path="/admin" element={<AdminPanelScreen />} /> */}
      </Route>

      <Route element={<RoleBasedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
        {/* <Route path="/reports" element={<ReportsScreen />} /> */}
      </Route>
    </Routes>
  );
}
