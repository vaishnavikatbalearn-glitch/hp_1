import { UseQueryResult } from '@tanstack/react-query';

/**
 * Utility hook for managing common data list states (loading, empty, error)
 * Reduces duplicate conditional rendering across list-based screens
 */
export function useDataList<T>(query: UseQueryResult<T[], unknown>) {
  return {
    data: query.data || [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    isEmpty: (query.data?.length ?? 0) === 0,
  };
}
