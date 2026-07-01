# Axios Architecture Audit

## Scope
Reviewed the frontend axios usage and API client wiring only.

## 1. Axios instances located

### Primary shared client
- File: frontend/src/auth-integration/src/api/axiosInstance.ts
- Instance: apiClient
- Created with axios.create(...)
- Configuration:
  - baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'
  - withCredentials: true
  - headers: Content-Type: application/json

### Refresh-only client
- File: frontend/src/auth-integration/src/api/axiosInstance.ts
- Instance: refreshClient
- Created with axios.create(...)
- Configuration:
  - baseURL: same as apiClient
  - withCredentials: true
- Purpose: used only for refresh requests so refresh failures do not recursively trigger the main interceptor flow.

## 2. Consumers of the shared client
The shared apiClient is used by:
- frontend/src/auth-integration/src/api/authService.ts
- frontend/src/auth-integration/src/api/laundryService.ts
- frontend/src/services/api.ts
- frontend/src/pages/student/StudentPortal.tsx
- frontend/src/pages/parent/parent-dashboard.tsx
- frontend/src/pages/parent/parent-student-overview.tsx
- frontend/src/pages/warden/warden-absentee-list.tsx
- frontend/src/pages/warden/warden-attendance-monitoring.tsx
- frontend/src/pages/warden/warden-dashboard.tsx
- frontend/src/pages/warden/warden-leave-approvals.tsx
- frontend/src/pages/warden/warden-reports.tsx
- frontend/src/pages/warden/warden-student-details.tsx
- frontend/src/pages/warden/warden-student-management.tsx

## 3. Duplicate instances
Finding: No duplicate production axios client instances were found.

What exists instead:
- One main client: apiClient
- One auxiliary refresh client: refreshClient

This is not a duplicate architecture issue; it is an intentional split for refresh handling.

## 4. Duplicate interceptors
Finding: No duplicate interceptor registration was found.

### Interceptors attached
- File: frontend/src/auth-integration/src/api/axiosInstance.ts
- Request interceptor on apiClient:
  - Adds Authorization header from the in-memory access token when present.
- Response interceptor on apiClient:
  - Handles 401 responses with a refresh flow.
  - Uses refreshClient for the refresh call.
  - Retries the original request after a successful refresh.
  - Clears the session and invokes the auth failure handler if refresh fails.

### Notes
- The refresh client does not have its own request/response interceptors.
- The interceptor logic is centralized in one place, which avoids duplication.

## 5. Architecture summary
The frontend currently uses a single centralized axios architecture:
- one shared apiClient for application requests
- one refresh-specific client for auth refresh
- a single request interceptor and a single response interceptor attached to the main client
- shared token storage via tokenManager
- a global auth failure callback registered from the auth context

## 6. Conclusion
The axios architecture is consolidated and does not show duplicate instances or duplicate interceptor wiring. The main concern is architectural consistency rather than duplication: several page-level modules call the shared client directly rather than through a more domain-specific service layer, but that is a design pattern issue rather than an axios duplication issue.
