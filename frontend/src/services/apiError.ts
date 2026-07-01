// ─── API Error Handling & Types ────────────────────────────────────────────────
// Centralized error types, handlers, and utilities for the API layer.

import { AxiosError } from 'axios';

/**
 * Structured API error with context
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromAxiosError(error: AxiosError): ApiError {
    const statusCode = error.response?.status ?? 0;
    const responseData = error.response?.data as any;
    
    const message = 
      responseData?.message ??
      error.message ??
      ApiError.getDefaultMessage(statusCode);
    
    const code = responseData?.code ?? error.code;
    const details = responseData?.details;

    return new ApiError(statusCode, message, code, details);
  }

  private static getDefaultMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      400: 'Bad request. Please check your input.',
      401: 'Unauthorized. Please log in again.',
      403: 'Forbidden. You do not have permission to access this resource.',
      404: 'Resource not found.',
      409: 'Conflict. This resource already exists.',
      422: 'Validation failed. Please check your input.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      503: 'Service unavailable. Please try again later.',
    };
    return messages[statusCode] ?? 'An unexpected error occurred.';
  }

  /**
   * Check if error is due to network
   */
  isNetworkError(): boolean {
    return this.statusCode === 0 || this.code === 'ERR_NETWORK';
  }

  /**
   * Check if error is authentication-related
   */
  isAuthError(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Check if error is validation-related
   */
  isValidationError(): boolean {
    return this.statusCode === 422 || this.statusCode === 400;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return 'Network connection error. Please check your internet connection.';
    }
    if (this.isAuthError()) {
      return 'Your session has expired. Please log in again.';
    }
    if (this.isValidationError()) {
      return this.message;
    }
    return this.message;
  }
}

/**
 * Result type for operations that may fail
 */
export type ApiResult<T> = { success: true; data: T } | { success: false; error: ApiError };

/**
 * Check if result is successful
 */
export function isSuccess<T>(result: ApiResult<T>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Check if result is an error
 */
export function isError<T>(result: ApiResult<T>): result is { success: false; error: ApiError } {
  return !result.success;
}

/**
 * Request state for operations
 */
export interface RequestState {
  isLoading: boolean;
  isError: boolean;
  error?: ApiError;
}

/**
 * Combined request states for parallel requests
 */
export function combineRequestStates(...states: RequestState[]): RequestState {
  return {
    isLoading: states.some(s => s.isLoading),
    isError: states.some(s => s.isError),
    error: states.find(s => s.error)?.error,
  };
}

/**
 * Safe API call wrapper with error handling
 */
export async function safeApiCall<T>(
  fn: () => Promise<T>,
  operationName?: string
): Promise<ApiResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err) {
    const error = err instanceof AxiosError 
      ? ApiError.fromAxiosError(err)
      : err instanceof ApiError
      ? err
      : new ApiError(0, err instanceof Error ? err.message : 'Unknown error', undefined, { originalError: err });
    
    console.error(`[API Error] ${operationName ?? 'Operation'} failed:`, error);
    return { success: false, error };
  }
}

/**
 * Retry logic for failed requests
 */
export async function retryApiCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // Don't retry on client errors (4xx)
      if (err instanceof AxiosError && err.response?.status && err.response.status < 500) {
        throw err;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError ?? new Error('Max retries exceeded');
}

/**
 * Parallel API calls with error aggregation
 */
export async function parallelApiCalls<T extends Record<string, Promise<any>>>(
  calls: T
): Promise<{
  data: { [K in keyof T]: Awaited<T[K]> };
  errors: Record<string, ApiError>;
}> {
  const results = await Promise.allSettled(Object.values(calls));
  const data: any = {};
  const errors: Record<string, ApiError> = {};
  
  let index = 0;
  for (const key in calls) {
    const result = results[index];
    if (result.status === 'fulfilled') {
      data[key] = result.value;
    } else {
      const err = result.reason;
      errors[key] = err instanceof AxiosError 
        ? ApiError.fromAxiosError(err)
        : err instanceof ApiError
        ? err
        : new ApiError(0, err instanceof Error ? err.message : 'Unknown error');
    }
    index++;
  }
  
  return { data, errors };
}
