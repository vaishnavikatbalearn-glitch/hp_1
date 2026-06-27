import { useMutation } from '@tanstack/react-query';
import { authService } from '../api/authService';
import { useAuth } from '../auth/AuthContext';
import type { LoginPayload } from '../auth/types';

export function useLogin() {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
    },
  });
}
