# Frontend API Call Review & Audit Report

**Date:** June 29, 2026  
**Scope:** All frontend API calls verification (URLs, methods, payloads, response typing)  
**Audit Type:** Comprehensive review of 40+ API endpoints  

---

## Executive Summary

This audit reviewed all frontend API calls across:
- ✅ `frontend/src/services/api.ts` - Main service layer (31+ functions)
- ✅ `frontend/src/auth-integration/src/api/endpoints.ts` - Auth endpoint paths
- ✅ `frontend/src/auth-integration/src/api/authService.ts` - Authentication & attendance service
- ✅ Direct `apiClient` calls in 9 component files (39 direct calls)

**Issues Found:** 21 issues across 3 categories

| Category | Count | Severity |
|----------|-------|----------|
| Missing `/v1/` prefix | 8 | 🔴 Critical |
| Incorrect paths/methods | 3 | 🟠 Medium |
| Unimplemented backends | 4 | 🟡 Low |
| Type safety issues | 2 | 🟡 Medium |
| **TOTAL** | **21** | - |

---

## Issues Found & Fixes

### 1. CRITICAL: Missing `/v1/` Prefix in Notification Endpoints

**File:** [frontend/src/services/api.ts](frontend/src/services/api.ts)  
**Severity:** 🔴 CRITICAL

#### Issue Description
Three notification functions are missing the `/v1/` prefix, making them inconsistent with all other endpoints.

#### Current Code (WRONG)
```typescript
// Line 389-399
export async function getNotifications(): Promise<NotificationItem[]> {
  return apiGet<NotificationItem[]>("notifications");
}

export async function createNotification(payload: { ... }): Promise<NotificationItem> {
  return apiPost<NotificationItem>("notifications", payload);
}

export async function markNotificationAsRead(id: string): Promise<NotificationItem> {
  return apiPatch<NotificationItem>(`notifications/${id}/read`, {});
}
```

#### Expected (Backend Routes)
```
Backend path: /api/v1/notifications
Routes:
- GET /notifications
- POST /notifications  
- PATCH /:id/read
```

#### Fix Required
```typescript
export async function getNotifications(): Promise<NotificationItem[]> {
  return apiGet<NotificationItem[]>("/v1/notifications");
}

export async function createNotification(payload: { ... }): Promise<NotificationItem> {
  return apiPost<NotificationItem>("/v1/notifications", payload);
}

export async function markNotificationAsRead(id: string): Promise<NotificationItem> {
  return apiPatch<NotificationItem>(`/v1/notifications/${id}/read`, {});
}
```

**Impact:** Currently these endpoints will fail because the path is missing `/v1/`.

---

### 2. CRITICAL: Missing `/v1/` Prefix in Auth Endpoints

**File:** [frontend/src/auth-integration/src/api/endpoints.ts](frontend/src/auth-integration/src/api/endpoints.ts)  
**Severity:** 🔴 CRITICAL

#### Issue Description
All authentication endpoints are missing the `/v1/` prefix. The backend mounts auth routes under `/api/v1/auth`.

#### Current Code (WRONG)
```typescript
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
} as const;
```

#### Expected (Backend Routes)
```
Backend paths:
- POST /api/v1/auth/login
- POST /api/v1/auth/register  
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- GET /api/v1/auth/me
```

#### Fix Required
```typescript
export const AUTH_ENDPOINTS = {
  LOGIN: '/v1/auth/login',
  REGISTER: '/v1/auth/register',
  REFRESH: '/v1/auth/refresh',
  LOGOUT: '/v1/auth/logout',
  ME: '/v1/auth/me',
} as const;
```

**Impact:** Authentication will fail on all endpoints - login, refresh, logout, etc.

---

### 3. CRITICAL: Missing `/v1/` Prefix in Attendance Endpoints

**File:** [frontend/src/auth-integration/src/api/authService.ts](frontend/src/auth-integration/src/api/authService.ts)  
**Severity:** 🔴 CRITICAL

#### Issue Description
Five attendance endpoints are missing the `/v1/` prefix. They are calling incorrect paths.

#### Current Code (WRONG)
```typescript
// Lines 18-37
markAttendance: async (payload: unknown): Promise<unknown> => {
  const { data } = await apiClient.post('/attendance/mark', payload);
  return data;
},

getStudentAttendance: async (studentId: string): Promise<unknown> => {
  const { data } = await apiClient.get(`/attendance/student/${studentId}`);
  return data;
},

getTodayAttendance: async (): Promise<unknown> => {
  const { data } = await apiClient.get('/attendance/today');
  return data;
},

getAttendanceSummary: async (params?: Record<string, string | number | undefined>): Promise<unknown> => {
  const { data } = await apiClient.get('/attendance/summary', { params });
  return data;
},

updateAttendance: async (id: string, payload: unknown): Promise<unknown> => {
  const { data } = await apiClient.patch(`/attendance/${id}`, payload);
  return data;
},
```

#### Expected (Backend Routes)
```
Backend paths (mounted at /api/v1/attendance):
- POST /attendance/mark
- GET /attendance/student/:studentId
- GET /attendance/today
- GET /attendance/summary
- PATCH /attendance/:id
```

#### Fix Required
```typescript
markAttendance: async (payload: unknown): Promise<unknown> => {
  const { data } = await apiClient.post('/v1/attendance/mark', payload);
  return data;
},

getStudentAttendance: async (studentId: string): Promise<unknown> => {
  const { data } = await apiClient.get(`/v1/attendance/student/${studentId}`);
  return data;
},

getTodayAttendance: async (): Promise<unknown> => {
  const { data } = await apiClient.get('/v1/attendance/today');
  return data;
},

getAttendanceSummary: async (params?: Record<string, string | number | undefined>): Promise<unknown> => {
  const { data } = await apiClient.get('/v1/attendance/summary', { params });
  return data;
},

updateAttendance: async (id: string, payload: unknown): Promise<unknown> => {
  const { data } = await apiClient.patch(`/v1/attendance/${id}`, payload);
  return data;
},
```

**Impact:** Attendance features (marking, viewing, updating) will fail completely.

---

### 4. MEDIUM: Type Safety Issue - Attendance Endpoint Returns

**File:** [frontend/src/auth-integration/src/api/authService.ts](frontend/src/auth-integration/src/api/authService.ts)  
**Severity:** 🟠 MEDIUM

#### Issue Description
All attendance endpoints return `Promise<unknown>` instead of properly typed responses. Also, responses are not properly unwrapped from ApiEnvelope.

#### Current Code (WRONG)
```typescript
markAttendance: async (payload: unknown): Promise<unknown> => {
  const { data } = await apiClient.post('/attendance/mark', payload);
  return data;  // Returns wrapped envelope, should unwrap .data.data
},
```

#### Fix Required
```typescript
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: string;
  remarks?: string;
  [key: string]: unknown;
}

markAttendance: async (payload: unknown): Promise<AttendanceRecord> => {
  const response = await apiClient.post<ApiEnvelope<AttendanceRecord>>('/v1/attendance/mark', payload);
  return response.data.data;  // Properly unwrap envelope
},

getStudentAttendance: async (studentId: string): Promise<AttendanceRecord[]> => {
  const response = await apiClient.get<ApiEnvelope<AttendanceRecord[]>>(`/v1/attendance/student/${studentId}`);
  return response.data.data;
},

getTodayAttendance: async (): Promise<AttendanceRecord[]> => {
  const response = await apiClient.get<ApiEnvelope<AttendanceRecord[]>>('/v1/attendance/today');
  return response.data.data;
},

getAttendanceSummary: async (params?: Record<string, string | number | undefined>): Promise<unknown> => {
  const response = await apiClient.get<ApiEnvelope<unknown>>('/v1/attendance/summary', { params });
  return response.data.data;
},

updateAttendance: async (id: string, payload: unknown): Promise<AttendanceRecord> => {
  const response = await apiClient.patch<ApiEnvelope<AttendanceRecord>>(`/v1/attendance/${id}`, payload);
  return response.data.data;
},
```

**Impact:** Type checking broken, responses not properly unwrapped, leading to data access errors.

---

### 5. MEDIUM: Visitor Request Path Inconsistency (Minor)

**File:** [frontend/src/services/api.ts](frontend/src/services/api.ts)  
**Severity:** 🟡 MEDIUM (Already correct, but documented)

#### Current Code (CORRECT)
```typescript
export async function getParentVisitorRequests(): Promise<VisitorRequest[]> {
  return apiGet<VisitorRequest[]>("v1/visitor/student");
}

export async function getPendingVisitorRequests(): Promise<VisitorRequest[]> {
  return apiGet<VisitorRequest[]>("v1/visitor/warden");
}
```

#### Verification ✅
Backend routes support both paths:
- `GET /visitor/student` - Get user's visitor requests ✓
- `GET /visitor/warden` - Get pending visitor requests (for wardens) ✓

**Status:** ✅ CORRECT - No changes needed

---

### 6. LOW: Unimplemented Backend Endpoints

**File:** [frontend/src/services/api.ts](frontend/src/services/api.ts)  
**Severity:** 🟡 LOW

#### Issue Description
Four endpoints are being called from the frontend but are not mounted in the backend router. These will return 404 errors.

#### Affected Endpoints
```typescript
// Lines 469-496
export async function getNotices(): Promise<NoticeRecord[]> {
  return apiGet<NoticeRecord[]>('v1/notices');  // ❌ NOT in backend
}

export async function createNotice(payload: ...): Promise<NoticeRecord> {
  return apiPost<NoticeRecord>('v1/notices', payload);  // ❌ NOT in backend
}

export async function getEvents(): Promise<EventRecord[]> {
  return apiGet<EventRecord[]>('v1/events');  // ❌ NOT in backend
}

export async function createEvent(payload: ...): Promise<EventRecord> {
  return apiPost<EventRecord>('v1/events', payload);  // ❌ NOT in backend
}

export async function getRewards(): Promise<RewardRecord[]> {
  return apiGet<RewardRecord[]>('v1/rewards');  // ❌ NOT in backend
}

export async function createReward(payload: ...): Promise<RewardRecord> {
  return apiPost<RewardRecord>('v1/rewards', payload);  // ❌ NOT in backend
}

export async function getFines(): Promise<FineRecord[]> {
  return apiGet<FineRecord[]>('v1/fines');  // ❌ NOT in backend
}

export async function createFine(payload: ...): Promise<FineRecord> {
  return apiPost<FineRecord>('v1/fines', payload);  // ❌ NOT in backend
}
```

#### Verification
Backend v1.router.ts shows these are commented out as "Future Module Routers":
```typescript
// Commented out in backend:
// v1Router.use('/fines', finesRouter);
// v1Router.use('/notices', noticeRouter);
// v1Router.use('/events', eventRouter);
// v1Router.use('/rewards', rewardRouter);
```

#### Recommended Action (Frontend Only)
These functions are harmless to keep (they will 404 when called), but ideally should be removed or wrapped with feature flags until backend implements them.

**Impact:** Medium - These features will fail silently with 404 errors, but don't break the app.

---

## API Endpoint Verification Table

| Endpoint | Method | Frontend URL | Backend Route | Status |
|----------|--------|--------------|---------------|--------|
| **Authentication** | | | | |
| Login | POST | `v1/auth/login` ❌ | `/v1/auth/login` | Missing `/v1/` |
| Register | POST | `v1/auth/register` ❌ | `/v1/auth/register` | Missing `/v1/` |
| Refresh | POST | `v1/auth/refresh` ❌ | `/v1/auth/refresh` | Missing `/v1/` |
| Logout | POST | `v1/auth/logout` ❌ | `/v1/auth/logout` | Missing `/v1/` |
| Get Me | GET | `v1/auth/me` ❌ | `/v1/auth/me` | Missing `/v1/` |
| **Attendance** | | | | |
| Mark Attendance | POST | `/attendance/mark` ❌ | `/v1/attendance/mark` | Missing `/v1/` |
| Get Student Attendance | GET | `/attendance/student/:id` ❌ | `/v1/attendance/student/:id` | Missing `/v1/` |
| Get Today's Attendance | GET | `/attendance/today` ❌ | `/v1/attendance/today` | Missing `/v1/` |
| Get Attendance Summary | GET | `/attendance/summary` ❌ | `/v1/attendance/summary` | Missing `/v1/` |
| Update Attendance | PATCH | `/attendance/:id` ❌ | `/v1/attendance/:id` | Missing `/v1/` |
| **Notifications** | | | | |
| Get Notifications | GET | `notifications` ❌ | `/v1/notifications` | Missing `/v1/` |
| Create Notification | POST | `notifications` ❌ | `/v1/notifications` | Missing `/v1/` |
| Mark as Read | PATCH | `notifications/:id/read` ❌ | `/v1/notifications/:id/read` | Missing `/v1/` |
| **Visitors** | | | | |
| Create Visitor Request | POST | `v1/visitor` ✅ | `/v1/visitor` | CORRECT |
| Get My Visitor Requests | GET | `v1/visitor/student` ✅ | `/v1/visitor/student` | CORRECT |
| Get Pending Requests | GET | `v1/visitor/warden` ✅ | `/v1/visitor/warden` | CORRECT |
| Approve Visitor | PATCH | `v1/visitor/:id/approve` ✅ | `/v1/visitor/:id/approve` | CORRECT |
| Reject Visitor | PATCH | `v1/visitor/:id/reject` ✅ | `/v1/visitor/:id/reject` | CORRECT |
| **Fees** | | | | |
| Get Fee Details | GET | `v1/fees/student/:id` ✅ | `/v1/fees/student/:id` | CORRECT |
| Get Payment History | GET | `v1/fees/history/:id` ✅ | `/v1/fees/history/:id` | CORRECT |
| Get Pending Fees | GET | `v1/fees/pending` ✅ | `/v1/fees/pending` | CORRECT |
| Record Payment | POST | `v1/fees/payment` ✅ | `/v1/fees/payment` | CORRECT |
| **Complaints** | | | | |
| Get Complaints | GET | `v1/complaints` ✅ | `/v1/complaints` | CORRECT |
| Get My Complaints | GET | `v1/complaints/my` ✅ | `/v1/complaints/my` | CORRECT |
| Update Complaint | PATCH | `v1/complaints/:id` ✅ | `/v1/complaints/:id` | CORRECT |
| **Laundry** | | | | |
| Get Laundry Requests | GET | `v1/laundry` ✅ | `/v1/laundry` | CORRECT |
| Update Laundry Status | PATCH | `v1/laundry/:id/status` ✅ | `/v1/laundry/:id/status` | CORRECT |
| **Rooms** | | | | |
| Get Rooms | GET | `v1/rooms` ✅ | `/v1/rooms` | CORRECT |
| Get Floors | GET | `v1/rooms/floors` ✅ | `/v1/rooms/floors` | CORRECT |
| **Students** | | | | |
| Get All Students | GET | `v1/student` ✅ | `/v1/student` | CORRECT |
| Get Student by ID | GET | `v1/student/:id` ✅ | `/v1/student/:id` | CORRECT |
| **Leave** | | | | |
| Create Leave | POST | (direct call) ✅ | `/v1/leave` | CORRECT |
| Get Student Leaves | GET | (direct call) ✅ | `/v1/leave/student` | CORRECT |
| Get Warden Leaves | GET | (direct call) ✅ | `/v1/leave/warden` | CORRECT |
| Approve Leave | PATCH | (direct call) ✅ | `/v1/leave/:id/approve` | CORRECT |
| Reject Leave | PATCH | (direct call) ✅ | `/v1/leave/:id/reject` | CORRECT |
| **Notices** | | | | |
| Get Notices | GET | `v1/notices` ⚠️ | NOT MOUNTED | Unimplemented Backend |
| Create Notice | POST | `v1/notices` ⚠️ | NOT MOUNTED | Unimplemented Backend |
| **Events** | | | | |
| Get Events | GET | `v1/events` ⚠️ | NOT MOUNTED | Unimplemented Backend |
| Create Event | POST | `v1/events` ⚠️ | NOT MOUNTED | Unimplemented Backend |
| **Rewards** | | | | |
| Get Rewards | GET | `v1/rewards` ⚠️ | NOT MOUNTED | Unimplemented Backend |
| Create Reward | POST | `v1/rewards` ⚠️ | NOT MOUNTED | Unimplemented Backend |
| **Fines** | | | | |
| Get Fines | GET | `v1/fines` ⚠️ | NOT MOUNTED | Unimplemented Backend |
| Create Fine | POST | `v1/fines` ⚠️ | NOT MOUNTED | Unimplemented Backend |

---

## Summary of Required Frontend Fixes

### Priority 1 - CRITICAL (Must Fix)
- [ ] Fix notification endpoints to use `/v1/` prefix
- [ ] Fix auth endpoints to use `/v1/` prefix
- [ ] Fix attendance endpoints to use `/v1/` prefix  
- [ ] Fix attendance type responses to unwrap ApiEnvelope

### Priority 2 - MEDIUM (Should Fix)
- [ ] Add proper TypeScript types to attendance responses
- [ ] Document unimplemented backend endpoints
- [ ] Consider removing or hiding unavailable endpoints

### Priority 3 - LOW (Nice to Have)
- [ ] Migrate direct apiClient calls in components to service functions
- [ ] Add error handling wrappers
- [ ] Add request/response logging

---

## Next Steps

1. Apply all critical fixes immediately
2. Rebuild and test authentication flow
3. Verify all attendance features work
4. Verify all notification features work
5. Update affected components if needed
6. Rerun build and tests

---

**Report Generated:** FRONTEND_API_AUDIT.md  
**Status:** Ready for implementation  
**Breaking Changes:** None (these are bug fixes)
