// ─── API Loading State Utilities ──────────────────────────────────────────────
// Helpers for managing and combining loading states across components.

import { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

/**
 * Extract loading state from React Query result
 */
export interface LoadingState {
  isLoading: boolean;
  isFetching: boolean;
  isIdle: boolean;
  isPending: boolean; // For mutations
}

/**
 * Get loading state from React Query useQuery hook
 */
export function getQueryLoadingState<T>(query: UseQueryResult<T, unknown>): LoadingState {
  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isIdle: query.isIdle,
    isPending: query.isLoading || query.isFetching,
  };
}

/**
 * Get loading state from React Query useMutation hook
 */
export function getMutationLoadingState<T, V = unknown, E = unknown>(
  mutation: UseMutationResult<T, E, V>
): LoadingState {
  return {
    isLoading: false,
    isFetching: false,
    isIdle: mutation.status === 'idle',
    isPending: mutation.isPending,
  };
}

/**
 * Combine multiple loading states
 */
export function combineLoadingStates(...states: LoadingState[]): LoadingState {
  return {
    isLoading: states.some(s => s.isLoading),
    isFetching: states.some(s => s.isFetching),
    isIdle: states.every(s => s.isIdle),
    isPending: states.some(s => s.isPending),
  };
}

/**
 * Check if any loading state is active
 */
export function isAnyLoading(...states: LoadingState[]): boolean {
  return states.some(s => s.isLoading || s.isFetching || s.isPending);
}

/**
 * Check if all loading states are idle
 */
export function isAllIdle(...states: LoadingState[]): boolean {
  return states.every(s => s.isIdle);
}

/**
 * Debounce loading state to prevent UI flicker
 * (show loading only after a certain duration)
 */
export function debounceLoadingState(
  isLoading: boolean,
  delayMs: number = 300
): boolean {
  // Note: This hook version requires useEffect, implemented separately
  // This is the pure logic version
  return isLoading;
}

/**
 * React hook for debounced loading state
 */
import { useState, useEffect } from 'react';

export function useDebounceLoading(isLoading: boolean, delayMs: number = 300): boolean {
  const [debouncedLoading, setDebouncedLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Show loading immediately
      setDebouncedLoading(true);
    } else {
      // Delay hiding loading to prevent flicker
      const timer = setTimeout(() => setDebouncedLoading(false), delayMs);
      return () => clearTimeout(timer);
    }
  }, [isLoading, delayMs]);

  return debouncedLoading;
}

/**
 * Check if a query is in initial loading state
 */
export function isInitialLoading<T>(query: UseQueryResult<T, unknown>): boolean {
  return query.isLoading && query.data === undefined;
}

/**
 * Check if a query is in subsequent loading state (refetching)
 */
export function isRefetching<T>(query: UseQueryResult<T, unknown>): boolean {
  return query.isFetching && query.data !== undefined;
}

/**
 * Create a loading state with consistent shape
 */
export function createLoadingState(
  isLoading: boolean = false,
  isFetching: boolean = false
): LoadingState {
  return {
    isLoading,
    isFetching,
    isIdle: !isLoading && !isFetching,
    isPending: isLoading || isFetching,
  };
}
