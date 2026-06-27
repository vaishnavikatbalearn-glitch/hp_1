import { useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import type { RegisterPayload, Role } from '../auth/types';

// vvv UPDATE THIS PATH to point at your actual generated component vvv
import { RegisterScreen } from '../../screens/RegisterScreen';

/**
 * Same non-invasive pattern as LoginScreenContainer — only props are
 * supplied, RegisterScreen's UI is untouched.
 */
export function RegisterScreenContainer() {
  const navigate = useNavigate();
  const { mutateAsync, isPending, error } = useRegister();

  const handleRegister = async (payload: RegisterPayload) => {
    const { user } = await mutateAsync(payload);
    // Backend logs the user in on register (see useRegister.ts comment).
    // If yours doesn't, navigate('/login') instead.
    navigate(getRedirectPath(user.role), { replace: true });
  };

  return (
    <RegisterScreen
      onSubmit={handleRegister}
      isLoading={isPending}
      errorMessage={error ? extractErrorMessage(error) : undefined}
    />
  );
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? 'Registration failed. Please try again.';
  }
  return 'Registration failed. Please try again.';
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
