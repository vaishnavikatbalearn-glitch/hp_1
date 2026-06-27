import { useQuery } from '@tanstack/react-query';
import { authService } from '../api/authService';
import { useAuth } from '../auth/AuthContext';

/**
 * For re-fetching/refreshing profile data elsewhere in the app (e.g. an
 * account/profile screen). AuthContext already fetches the user once on
 * bootstrap — this hook is for screens that want their own subscription
 * to that data, with normal React Query caching/refetch behavior.
 */
export function useCurrentUser() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
