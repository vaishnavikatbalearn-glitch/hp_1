# Attendance Module Report

## Scope
This report reviews the attendance module only across the frontend pages, backend routes, Prisma database usage, and current API integration points.

No application code was modified.

## 1. Frontend pages

### Student attendance page
- The student-facing attendance screen is implemented in [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx).
- It currently calls the attendance service for:
  - today attendance
  - student-specific attendance history
  - marking attendance
- The UI also includes a calendar and bar chart, but the calendar is still visually generated from local placeholder data rather than real attendance history.
- The page builds its own summary from fetched records, which is a good start, but it is still not fully wired to a complete live attendance history flow.

### Parent attendance page
- The parent attendance screen is implemented in [frontend/src/pages/parent/parent-attendance.tsx](frontend/src/pages/parent/parent-attendance.tsx).
- It is currently static and hard-coded with mock values such as today status, monthly totals, and recent attendance entries.
- There is no live API call to the attendance backend from this page.

### Warden attendance page
- The warden attendance monitoring screen is implemented in [frontend/src/pages/warden/warden-attendance-monitoring.tsx](frontend/src/pages/warden/warden-attendance-monitoring.tsx).
- It is also static and uses hard-coded counters for present, absent, and late students.
- There is no live attendance data loading or export integration from the backend.

### Admin/dashboard usage
- The admin area references attendance data in [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx).
- It calls the attendance summary endpoint and renders charts using the response shape from the backend summary route.
- This is the most connected frontend surface in the attendance area.

## 2. Backend routes

The attendance router is mounted in [backend/src/routes/v1.router.ts](backend/src/routes/v1.router.ts) and defined in [backend/src/modules/attendance/attendance.routes.ts](backend/src/modules/attendance/attendance.routes.ts).

### Available endpoints
- POST /api/v1/attendance/mark
  - Requires authentication and attendance:mark permission.
- GET /api/v1/attendance/student/:studentId
  - Requires authentication and attendance:read permission.
- GET /api/v1/attendance/today
  - Requires authentication and attendance:read permission.
- GET /api/v1/attendance/summary
  - Requires authentication and attendance:report permission.
- PATCH /api/v1/attendance/:id
  - Requires authentication and attendance:mark permission.

### Access control
- The routes are protected by authentication and RBAC middleware from [backend/src/middleware/authenticate.middleware.ts](backend/src/middleware/authenticate.middleware.ts) and [backend/src/middleware/rbac.middleware.ts](backend/src/middleware/rbac.middleware.ts).
- The route-level permission map is defined in [backend/src/middleware/rbac.middleware.ts](backend/src/middleware/rbac.middleware.ts).

## 3. Database usage

The attendance data model is defined in [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

### Prisma model details
- The Attendance model stores:
  - studentId
  - date
  - status
  - remarks
  - markedBy
  - timestamps
- It uses a composite uniqueness constraint on studentId + date, which prevents duplicate attendance entries for the same student on the same day.
- The model is mapped to the attendances table.

### Service-layer database usage
The controller delegates to [backend/src/modules/attendance/attendance.service.ts](backend/src/modules/attendance/attendance.service.ts), which uses Prisma to:
- create attendance records
- query by student
- query by date
- count present/absent/on-leave records
- build summary data using SQL aggregation
- update existing records

## 4. API integration status

### Existing integration layer
- The shared frontend auth integration wrapper in [frontend/src/auth-integration/src/api/authService.ts](frontend/src/auth-integration/src/api/authService.ts) already calls the backend attendance endpoints.
- The axios client is defined in [frontend/src/auth-integration/src/api/axiosInstance.ts](frontend/src/auth-integration/src/api/axiosInstance.ts).

### Important integration issues
1. Route prefix mismatch
- The backend routes are mounted under /api/v1/attendance.
- The frontend axios base URL is set to /api, so calls that use a leading slash such as /attendance/mark may resolve to the wrong URL shape.
- This creates a strong risk of failed requests unless the frontend paths are normalized.

2. Response-shape mismatch
- The student portal expects a summary shape with fields such as overallAttendance, departmentAttendance, hostelAttendance, dailySummary, and monthlySummary.
- The backend summary endpoint currently returns a different structure with fields such as overallPercentage, monthly, daily, department, and hostel.
- This means the consumer-side parsing is likely inconsistent with the backend.

3. Partial integration
- The student page is partially integrated, but the parent and warden pages are not.
- The admin dashboard uses summary data, but the broader attendance workflow is still not fully connected end to end.

## 5. Missing functionality

### Functional gaps
- Parent attendance page has no live backend integration.
- Warden monitoring page has no live backend integration.
- No real attendance calendar/history is rendered for parent or warden users.
- No export or bulk-report workflow is wired for warden use.
- No department-level or hostel-level aggregation is implemented beyond placeholder values in the summary response.
- The backend summary response returns placeholder department data rather than true department-based aggregation.
- The student page’s “mark attendance” flow appears to be a UI-side interaction rather than a complete workflow around real attendance moderation and history.

### Data-model gaps
- Attendance status is limited to PRESENT, ABSENT, and ON_LEAVE.
- There is no explicit support for late arrivals, excused absences, or custom attendance categories in the current schema and route contract.
- There is no visible support for pagination, filtering, or date-range filtering in the current attendance API shape.

## 6. Overall assessment

The backend attendance module is present and reasonably structured, and the database model is solid for basic attendance tracking. The main issues are on the frontend integration side:
- parent and warden pages remain static,
- some consumers use mismatched endpoint shapes,
- and the frontend response handling does not yet fully align with the backend contract.
