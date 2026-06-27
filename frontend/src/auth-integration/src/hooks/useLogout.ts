import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/authService';
import { useAuth } from '../auth/AuthContext';

export function useLogout() {
  const { clearSession } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    // Clear local session regardless of whether the network call succeeded —
    // the user should never get stuck "logged in" on the client because a
    // logout request happened to fail.
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
}
