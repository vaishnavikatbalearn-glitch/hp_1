import { useMutation } from '@tanstack/react-query';
import { authService } from '../api/authService';
import { useAuth } from '../auth/AuthContext';
import type { RegisterPayload } from '../auth/types';

/**
 * Assumes the backend logs the user in immediately on successful registration
 * (returns the same { accessToken, user } shape as /auth/login).
 *
 * If your backend instead just creates the account and requires a separate
 * login step, drop the `setSession` call in onSuccess and redirect to /login
 * from the RegisterScreenContainer instead.
 */
export function useRegister() {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
    },
  });
}
