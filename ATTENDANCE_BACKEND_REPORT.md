# Attendance Backend Report

## Scope
Reviewed the attendance backend module only, covering controller, service, routes, validation, middleware, and Prisma usage.

## 1. Controller
File: backend/src/modules/attendance/attendance.controller.ts

### Observations
- The controller is thin and delegates business logic to the service layer.
- Each handler uses asyncHandler to standardize error handling.
- Request bodies and params are cast directly from Express request objects.
- The controller is consistent with the rest of the backend structure.

### Notes
- The controller does not perform validation itself; validation is handled by middleware before the handler runs.
- Authenticated user context is read from the request for marking and updating attendance.

## 2. Service
File: backend/src/modules/attendance/attendance.service.ts

### Observations
- The service layer contains the attendance business logic and Prisma access.
- Duplicate attendance prevention is implemented using a composite unique key on studentId + date.
- The service uses Prisma to create, list, summarize, and update attendance records.

### Strengths
- The create flow normalizes the date to midnight before checking for existing records.
- The summary logic aggregates counts and daily breakdowns for reporting.
- Update logic preserves existing values when optional fields are omitted.

### Potential issues
- The service currently accepts a role parameter for today-attendance listing but does not change the query behavior based on role.
- The summary endpoint uses a raw SQL query for daily aggregation while the rest of the service uses Prisma methods.
- The department aggregation is currently a placeholder and returns the same totals as the hostel summary.

## 3. Routes
File: backend/src/modules/attendance/attendance.routes.ts

### Observations
- The routes are mounted under the v1 router at /attendance.
- Authentication and RBAC are applied on each route.
- Validation middleware is applied for body, params, and query inputs.

### Notes
- The route set covers:
  - POST /mark
  - GET /student/:studentId
  - GET /today
  - GET /summary
  - PATCH /:id

## 4. Validation
File: backend/src/modules/attendance/attendance.validation.ts

### Observations
- Zod schemas are used for request body, params, and query parsing.
- The body schema validates:
  - studentId as UUID
  - date as a coerced date
  - status as one of the allowed attendance values
  - remarks as an optional trimmed string up to 500 characters
- The params schema validates UUIDs for studentId and id.
- The query schema validates month and year values.

### Notes
- The validation layer is present and consistent with the backend conventions.
- The status enum in validation currently allows PRESENT, ABSENT, ON_LEAVE, but the Prisma schema also supports LATE and EXCUSED. This is a mismatch worth noting.

## 5. Middleware
Files reviewed:
- backend/src/middleware/authenticate.middleware.ts
- backend/src/middleware/validate.middleware.ts
- backend/src/middleware/rbac.middleware.ts

### Observations
- Authentication middleware attaches a decoded user to req.user and rejects missing or invalid tokens.
- Validation middleware uses Zod safely and replaces the request target with parsed/coerced data.
- RBAC middleware uses permission-based role checks for attendance actions.

### Notes
- The attendance routes use authenticate and requirePermission correctly.
- The attendance permission map is defined in RBAC middleware and includes:
  - attendance:mark
  - attendance:read
  - attendance:report

## 6. Prisma queries
File: backend/prisma/schema.prisma

### Observations
- The Attendance model exists with a composite unique constraint on studentId + date.
- The model includes fields for status, remarks, markedBy, and date.
- Indexes are present on studentId/date and date.

### Service query behavior
- createAttendanceRecord uses findUnique with studentId_date to prevent duplicates.
- listStudentAttendance uses findMany ordered by date descending.
- listTodayAttendance uses findMany on the current day and includes basic student info.
- getAttendanceSummary uses Prisma count for totals and a raw SQL query for daily breakdowns.
- modifyAttendance uses findUnique followed by update.

### Notes
- The Prisma model supports LATE and EXCUSED in the schema, but the validation schema does not currently allow those statuses.

## 7. Summary
The attendance backend module is structurally sound and follows the project’s conventions for controller-service-route layering. The main issues observed are:
- A small validation/schema mismatch for attendance status values.
- A placeholder department summary in the reporting logic.
- The today-attendance service branch does not meaningfully differ by role.

No code changes were made; this report is for audit and review purposes.
