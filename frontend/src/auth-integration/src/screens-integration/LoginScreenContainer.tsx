import { useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import type { LoginPayload, Role } from '../auth/types';

// vvv UPDATE THIS PATH to point at your actual generated component vvv
import { LoginScreen } from '../../screens/LoginScreen';

interface LocationState {
  from?: { pathname: string };
}

/**
 * This component does NOT change LoginScreen's markup, styles, or layout.
 * It only supplies data/behavior as props.
 *
 * Your generated LoginScreen almost certainly doesn't have these exact
 * prop names yet — see WIRING_GUIDE.md for the 3 ways to bridge that gap
 * (it's usually a 2-3 line change inside LoginScreen, not a redesign).
 */
export function LoginScreenContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync, isPending, error } = useLogin();

  const handleLogin = async (payload: LoginPayload) => {
    const { user } = await mutateAsync(payload);
    const redirectTo =
      (location.state as LocationState | undefined)?.from?.pathname ?? getRedirectPath(user.role);
    navigate(redirectTo, { replace: true });
  };

  return (
    <LoginScreen
      onSubmit={handleLogin}
      isLoading={isPending}
      errorMessage={error ? extractErrorMessage(error) : undefined}
    />
  );
}

function extractErrorMessage(error: unknown): string {
  // Narrow this to your backend's actual error envelope shape.
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? 'Login failed. Please check your credentials and try again.';
  }
  return 'Login failed. Please check your credentials and try again.';
}

function getRedirectPath(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'MANAGER':
      return '/reports';
    default:
      return '/dashboard';
  }
}
