# Attendance API Report

## Scope
- Verify backend attendance API routes for:
  - GET attendance
  - POST attendance
  - Attendance reports
  - Attendance analytics
  - Absentee list
- Compare frontend calls with backend routes
- Fix mismatches only

## Backend Attendance Routes
The backend attendance module exposes the following routes under `/api/v1/attendance`:

- `POST /api/v1/attendance/mark`
  - Marks attendance for a student
  - Validates body with `markAttendanceSchema`
- `GET /api/v1/attendance/student/:studentId`
  - Retrieves attendance records for a student
- `GET /api/v1/attendance/today`
  - Retrieves today’s attendance records
- `GET /api/v1/attendance/summary`
  - Retrieves monthly attendance summary and analytics
  - Accepts optional query params: `month`, `year`
- `PATCH /api/v1/attendance/:id`
  - Updates an existing attendance record

## Frontend Attendance Usage
Frontend usage is primarily through `frontend/src/auth-integration/src/api/authService.ts` and direct `apiClient` calls.

### Auth service attendance methods
- `markAttendance(payload)` → `POST /v1/attendance/mark`
- `getStudentAttendance(studentId)` → `GET /v1/attendance/student/${studentId}`
- `getTodayAttendance()` → `GET /v1/attendance/today`
- `getAttendanceSummary(params)` → `GET /v1/attendance/summary` with optional `month`/`year`
- `updateAttendance(id, payload)` → `PATCH /v1/attendance/${id}`

### Direct frontend attendance calls found
- `/v1/attendance/today`
  - used by `frontend/src/pages/warden/warden-absentee-list.tsx`
  - used by `frontend/src/pages/warden/warden-student-management.tsx`
- `/v1/attendance/summary`
  - used by `frontend/src/pages/parent/parent-dashboard.tsx`
  - used by `frontend/src/pages/parent/parent-student-overview.tsx`
  - used by `frontend/src/pages/warden/warden-attendance-monitoring.tsx`
  - used by `frontend/src/pages/warden/warden-dashboard.tsx`
  - used by `frontend/src/pages/warden/warden-reports.tsx`

## Attendance Features Covered
- **GET attendance**: `GET /v1/attendance/student/:studentId` and `GET /v1/attendance/today`
- **POST attendance**: `POST /v1/attendance/mark`
- **Attendance reports / analytics**: `GET /v1/attendance/summary`
- **Absentee list**: frontend uses `GET /v1/attendance/today` and filters `ABSENT` / `ON_LEAVE`

## Findings
- All frontend attendance route calls align with backend route definitions.
- There are no mismatched attendance endpoint paths between frontend and backend.
- The frontend does not use a dedicated `attendance/analytics` or `attendance/absentees` route; it correctly derives analytics from `/attendance/summary` and absentee data from `/attendance/today`.

## Fixes Made
- None required: no attendance route mismatches were found.

## Notes
- Backend uses `/api/v1/attendance/...` in the router, while frontend calls use `/v1/attendance/...`. This is correct if the frontend base URL includes `/api`.
- The report assumes the frontend HTTP client is configured with the correct base path so `/v1/...` resolves to `/api/v1/...`.
