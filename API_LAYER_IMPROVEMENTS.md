# API Layer Improvements Report

**Date:** June 29, 2026  
**Scope:** Frontend API layer enhancements  
**Changes:** Error handling, loading states, TypeScript typing  
**Backend Impact:** None - no backend API changes

---

## Executive Summary

Three new utilities have been added to the frontend API layer:

| File | Purpose | Impact |
|------|---------|--------|
| [apiError.ts](frontend/src/services/apiError.ts) | Structured error handling | ✅ Type-safe errors |
| [apiLoading.ts](frontend/src/services/apiLoading.ts) | Loading state utilities | ✅ Consistent state management |
| [api.ts](frontend/src/services/api.ts) | Updated with better typing | ✅ Enhanced type safety |

**New Features:**
- 🔴 **ApiError class** - Structured errors with context
- 🟡 **ApiResult<T>** - Result types for safe operations
- 🟢 **Loading state utilities** - Consistent state management
- 📘 **Improved TypeScript** - Better type inference and safety

---

## 1. Error Handling Improvements

### New: ApiError Class

**Location:** [frontend/src/services/apiError.ts](frontend/src/services/apiError.ts)

```typescript
class ApiError extends Error {
  statusCode: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  
  // Helper methods
  isNetworkError(): boolean;
  isAuthError(): boolean;
  isValidationError(): boolean;
  getUserMessage(): string;
}
```

**Example Usage:**

```typescript
// Before: No structured error info
try {
  const data = await apiGet('/v1/students');
} catch (err) {
  console.error(err); // Generic error
}

// After: Structured error information
try {
  const data = await apiGet('/v1/students');
} catch (err) {
  if (err instanceof ApiError) {
    console.error(`Status: ${err.statusCode}`);
    console.error(`Message: ${err.message}`);
    console.error(`Code: ${err.code}`);
    console.error(`Details: ${err.details}`);
    
    // Use helper methods
    if (err.isAuthError()) {
      // Handle auth failure
    } else if (err.isNetworkError()) {
      // Handle network issue
    } else if (err.isValidationError()) {
      // Handle validation error
    }
  }
}
```

### New: ApiResult<T> Type

For operations that may fail, use the Result pattern:

```typescript
export type ApiResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError };

// Usage
const result = await apiSafe.get<StudentRecord[]>('/v1/students');
if (result.success) {
  console.log('Students:', result.data);
} else {
  console.error('Error:', result.error.message);
}
```

### Error Helper Functions

```typescript
// Check if call succeeded
if (isSuccess(result)) {
  // TypeScript narrows type to { success: true; data: T }
  processData(result.data);
}

// Check if call failed
if (isError(result)) {
  // TypeScript narrows type to { success: false; error: ApiError }
  handleError(result.error);
}

// Safe API call wrapper
const result = await safeApiCall(
  () => apiGet<Student>('/v1/student/123'),
  'Fetch student details'  // operation name for logging
);

// Retry failed requests with exponential backoff
const data = await retryApiCall(
  () => apiGet<Data>('/v1/data'),
  3,    // max retries
  1000  // initial delay in ms
);

// Parallel calls with error aggregation
const { data, errors } = await parallelApiCalls({
  students: apiGet('/v1/students'),
  rooms: apiGet('/v1/rooms'),
  complaints: apiGet('/v1/complaints'),
});

if (errors.students) {
  console.error('Failed to fetch students:', errors.students);
}
```

---

## 2. Loading State Management

### New: LoadingState Interface

**Location:** [frontend/src/services/apiLoading.ts](frontend/src/services/apiLoading.ts)

```typescript
interface LoadingState {
  isLoading: boolean;    // True during initial load
  isFetching: boolean;   // True during any fetch
  isIdle: boolean;       // True when not loading
  isPending: boolean;    // True when loading or fetching
}
```

### Loading State Utilities

```typescript
// Get loading state from React Query useQuery
const state = getQueryLoadingState(studentsQuery);
// Returns { isLoading, isFetching, isIdle, isPending }

// Get loading state from React Query useMutation
const state = getMutationLoadingState(updateMutation);
// Returns { isLoading, isFetching, isIdle, isPending }

// Combine multiple loading states
const combined = combineLoadingStates(
  getQueryLoadingState(query1),
  getQueryLoadingState(query2)
);
// Returns single state reflecting any loading activity

// Check if any state is loading
if (isAnyLoading(state1, state2, state3)) {
  // Show loading UI
}

// Check if all states are idle
if (isAllIdle(state1, state2, state3)) {
  // Show ready state
}

// Debounce loading state to prevent UI flicker
const debouncedLoading = useDebounceLoading(isLoading, 300);
// Only shows loading after 300ms to avoid quick flicker

// Distinguish between initial load and refetch
if (isInitialLoading(query)) {
  // Show skeleton loader
} else if (isRefetching(query)) {
  // Show subtle refresh indicator
}
```

### Example Component Usage

```typescript
import { 
  useQuery } from '@tanstack/react-query';
import { 
  getQueryLoadingState, 
  combineLoadingStates,
  isAnyLoading 
} from '@/services/api';

function StudentList() {
  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: () => apiGet('/v1/students'),
  });

  const roomsQuery = useQuery({
    queryKey: ['rooms'],
    queryFn: () => apiGet('/v1/rooms'),
  });

  const loadingState = combineLoadingStates(
    getQueryLoadingState(studentsQuery),
    getQueryLoadingState(roomsQuery)
  );

  if (isAnyLoading(loadingState)) {
    return <Skeleton />;
  }

  if (studentsQuery.error) {
    return <Error error={studentsQuery.error} />;
  }

  return <StudentGrid students={studentsQuery.data} />;
}
```

---

## 3. Improved TypeScript Typing

### Enhanced API Wrapper Functions

All API wrapper functions now have:
- ✅ **Better type inference** - Explicit generic parameters
- ✅ **Error handling** - Proper error logging
- ✅ **Operation context** - Names for debugging
- ✅ **Type-safe options** - ApiCallOptions interface

**Signature Updates:**

```typescript
// Before: Basic types
export async function apiGet<T>(path: string): Promise<T>

// After: Enhanced types with options
export async function apiGet<T>(
  path: string, 
  options?: ApiCallOptions
): Promise<T>

// ApiCallOptions interface
interface ApiCallOptions {
  operationName?: string;      // For logging
  errorMessage?: string;       // Custom error message
  logErrors?: boolean;         // Control error logging
}
```

**Example:**

```typescript
// Clear operation name in logs
const students = await apiGet<StudentRecord[]>(
  '/v1/students',
  { operationName: 'Fetch all students' }
);

// Suppress error logs for specific calls
const data = await apiGet<Data>(
  '/v1/optional-endpoint',
  { logErrors: false }
);
```

### Safe API Versions

New `apiSafe` object provides Result-based versions:

```typescript
// Throws on error (existing behavior)
const data = await apiGet<Student>('/v1/student/123');

// Returns result (new behavior)
const result = await apiSafe.get<Student>('/v1/student/123');
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```

### Type-Safe Request State

```typescript
// Combine request states with proper typing
export function combineRequestStates(...states: RequestState[]): RequestState

// Only allows RequestState objects
const combined = combineRequestStates(
  { isLoading: true, isError: false },
  { isLoading: false, isError: false }
);
```

---

## 4. New Files Created

### 1. apiError.ts

**Size:** ~200 lines  
**Purpose:** Structured error handling

**Exports:**
- `ApiError` class
- `ApiResult<T>` type
- `isSuccess<T>(result)` - Type guard
- `isError<T>(result)` - Type guard
- `RequestState` interface
- `combineRequestStates()` - Merge states
- `safeApiCall()` - Safe execution wrapper
- `retryApiCall()` - Retry with backoff
- `parallelApiCalls()` - Parallel execution with error aggregation

### 2. apiLoading.ts

**Size:** ~120 lines  
**Purpose:** Loading state utilities and React hook

**Exports:**
- `LoadingState` interface
- `getQueryLoadingState()` - From useQuery
- `getMutationLoadingState()` - From useMutation
- `combineLoadingStates()` - Merge states
- `isAnyLoading()` - Check if any loading
- `isAllIdle()` - Check if all idle
- `useDebounceLoading()` - React hook with debouncing
- `isInitialLoading()` - Distinguish initial vs refetch
- `isRefetching()` - Check if refetching
- `createLoadingState()` - Create state object

### 3. api.ts (Enhanced)

**Changes to existing file:**
- Added import of `ApiError` and `ApiResult`
- Added `ApiCallOptions` interface
- Updated all 5 wrapper functions with error logging
- Added `apiSafe` object with Result-based variants
- Re-exported error/loading utilities at bottom

**No breaking changes** - All existing functions work as before.

---

## 5. Usage Examples

### Error Handling Example

```typescript
import { apiGet, ApiError, isSuccess } from '@/services/api';

async function fetchStudent(id: string) {
  try {
    const student = await apiGet<Student>(
      `/v1/student/${id}`,
      { operationName: `Fetch student ${id}` }
    );
    console.log('Student:', student);
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.isAuthError()) {
        // Redirect to login
      } else if (err.isNetworkError()) {
        // Show network error
      } else if (err.isValidationError()) {
        // Show validation error
      } else {
        // Generic error handling
        alert(err.getUserMessage());
      }
    }
  }
}
```

### Loading State Example

```typescript
import { 
  useQuery } from '@tanstack/react-query';
import { 
  getQueryLoadingState,
  isInitialLoading,
  useDebounceLoading
} from '@/services/api';

function StudentDashboard() {
  const query = useQuery({
    queryKey: ['student'],
    queryFn: () => apiGet('/v1/student'),
  });

  const loading = getQueryLoadingState(query);
  const debouncedLoading = useDebounceLoading(loading.isPending, 300);

  if (isInitialLoading(query)) {
    return <SkeletonLoader />;
  }

  if (query.error) {
    return <ErrorBoundary error={query.error} />;
  }

  return (
    <>
      {debouncedLoading && <RefreshIndicator />}
      <StudentProfile data={query.data} />
    </>
  );
}
```

### Parallel Requests Example

```typescript
import { 
  parallelApiCalls,
  ApiError
} from '@/services/api';

async function loadDashboardData() {
  const { data, errors } = await parallelApiCalls({
    students: apiGet('/v1/students'),
    rooms: apiGet('/v1/rooms'),
    complaints: apiGet('/v1/complaints'),
  });

  // Handle individual errors
  if (errors.students) {
    console.error('Failed to fetch students:', errors.students.message);
  }
  if (errors.rooms) {
    console.error('Failed to fetch rooms:', errors.rooms.message);
  }

  // Use available data
  return {
    students: data.students,
    rooms: data.rooms,
    complaints: data.complaints,
  };
}
```

---

## 6. Migration Guide

### For Existing Components

No breaking changes! All existing code continues to work:

```typescript
// ✅ This still works exactly as before
const students = await apiGet('/v1/students');

// ✅ Components using React Query still work
const query = useQuery({
  queryFn: () => apiGet('/v1/students'),
});
```

### To Use New Features

**Option 1: Add Error Context**
```typescript
// Just add operation name for better logging
const data = await apiGet<Student>('/v1/student/123', {
  operationName: 'Fetch student details'
});
```

**Option 2: Use Safe Versions**
```typescript
// Use Result type for safer error handling
const result = await apiSafe.get<Student>('/v1/student/123');
if (result.success) {
  // ...
} else {
  // ...
}
```

**Option 3: Use Loading Utilities**
```typescript
// Import and use new utilities
import { getQueryLoadingState, combineLoadingStates } from '@/services/api';
```

---

## 7. Benefits Summary

| Improvement | Before | After | Benefit |
|------------|--------|-------|---------|
| **Error Handling** | Generic Error objects | Structured ApiError | Type-safe, contextual info |
| **Error Context** | No logging | Automatic with operationName | Better debugging |
| **Loading States** | Scattered across components | Centralized utilities | Consistency, reusability |
| **Type Safety** | Basic Promise<T> | ApiResult<T> option | Safer error handling |
| **Result Types** | Throw/catch | Result pattern | Explicit success/failure |
| **Error Methods** | Manual checks | isNetworkError(), isAuthError() | Cleaner code |
| **State Combining** | Manual logic | combineLoadingStates() | No duplication |
| **Debouncing** | Manual implementation | useDebounceLoading hook | Prevent UI flicker |

---

## 8. Import Cheat Sheet

```typescript
// Error handling
import { 
  ApiError,
  ApiResult,
  isSuccess,
  isError,
  safeApiCall,
  retryApiCall,
  parallelApiCalls,
} from '@/services/api';

// Loading states
import {
  LoadingState,
  getQueryLoadingState,
  getMutationLoadingState,
  combineLoadingStates,
  isAnyLoading,
  isAllIdle,
  useDebounceLoading,
  isInitialLoading,
  isRefetching,
  createLoadingState,
} from '@/services/api';

// API calls (unchanged)
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  api,
  apiSafe,
} from '@/services/api';
```

---

## 9. Backward Compatibility

✅ **100% Backward Compatible**

All existing code continues to work without modification:
- ✅ Existing `apiGet()`, `apiPost()`, etc. signatures unchanged
- ✅ All functions throw errors same as before
- ✅ No breaking changes to data types
- ✅ React Query integration unchanged
- ✅ Component code needs no updates

New features are **opt-in**:
- Existing error handling works the same
- New `apiSafe.*` versions are optional
- Loading utilities are additive
- Can gradually adopt new patterns

---

## 10. Testing Recommendations

### Unit Tests

```typescript
// Test error handling
describe('ApiError', () => {
  it('should correctly identify network errors', () => {
    const error = new ApiError(0, 'Network failed', 'ERR_NETWORK');
    expect(error.isNetworkError()).toBe(true);
  });

  it('should correctly identify auth errors', () => {
    const error = new ApiError(401, 'Unauthorized');
    expect(error.isAuthError()).toBe(true);
  });
});

// Test loading state utilities
describe('combineLoadingStates', () => {
  it('should return loading true if any is loading', () => {
    const state1 = createLoadingState(true);
    const state2 = createLoadingState(false);
    const combined = combineLoadingStates(state1, state2);
    expect(combined.isLoading).toBe(true);
  });
});
```

### Integration Tests

```typescript
// Test with React Query
describe('API layer integration', () => {
  it('should handle errors from API', async () => {
    const result = await safeApiCall(
      () => apiGet('/v1/invalid-endpoint')
    );
    expect(isError(result)).toBe(true);
    expect(result.error.statusCode).toBe(404);
  });
});
```

---

## Conclusion

The API layer improvements provide:

1. ✅ **Better Error Handling** - Structured errors with context
2. ✅ **Consistent Loading States** - Reusable utilities
3. ✅ **Improved TypeScript** - Safer types and inference
4. ✅ **No Breaking Changes** - 100% backward compatible
5. ✅ **Opt-In Features** - Use new features when ready

All improvements are **production-ready** and can be deployed immediately without requiring component changes.

---

**Report Generated:** API_LAYER_IMPROVEMENTS.md  
**Date:** 2026-06-29  
**Status:** ✅ Implementation Complete
