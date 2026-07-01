# Leave API Report

## Scope
- Review backend leave API routes for create, student list, warden list, approve, and reject flows.
- Compare these routes with frontend usage in student, parent, and warden screens.
- Fix mismatches only and document the results.

## Backend Leave Routes
The backend leave module exposes the following routes under `/api/v1/leave`:

- `POST /api/v1/leave/`
  - Creates a new leave request.
  - Requires `leave:create` permission.
  - Expects a body with `type`, `startDate`, `endDate`, `reason`, `destination`, and `contactNumber`.
- `GET /api/v1/leave/student`
  - Returns leave requests for the authenticated student.
  - Requires `leave:read` permission.
- `GET /api/v1/leave/warden`
  - Returns pending leave requests for wardens.
  - Requires `leave:approve` permission.
- `PATCH /api/v1/leave/:id/approve`
  - Approves a leave request.
  - Requires `leave:approve` permission.
- `PATCH /api/v1/leave/:id/reject`
  - Rejects a leave request.
  - Requires `leave:reject` permission.
  - Expects `{ rejectionReason }` in the request body.

## Frontend Leave Usage
Frontend leave calls were found in the following files:

- [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx)
  - `GET /v1/leave/student`
  - `POST /v1/leave`
- [frontend/src/pages/parent/parent-dashboard.tsx](frontend/src/pages/parent/parent-dashboard.tsx)
  - `GET /v1/leave/student`
- [frontend/src/pages/parent/parent-leave-tracking.tsx](frontend/src/pages/parent/parent-leave-tracking.tsx)
  - `GET /v1/leave/student`
- [frontend/src/pages/parent/parent-student-overview.tsx](frontend/src/pages/parent/parent-student-overview.tsx)
  - `GET /v1/leave/student`
- [frontend/src/pages/warden/warden-dashboard.tsx](frontend/src/pages/warden/warden-dashboard.tsx)
  - `GET /v1/leave/warden`
- [frontend/src/pages/warden/warden-leave-approvals.tsx](frontend/src/pages/warden/warden-leave-approvals.tsx)
  - `GET /v1/leave/warden`
  - `PATCH /v1/leave/:id/approve`
  - `PATCH /v1/leave/:id/reject`

## Findings
- The leave endpoint paths used by the frontend match the backend route definitions.
- The student create flow was not normalizing the backend response envelope correctly. The frontend was treating the response as though it were already the leave object, but the backend returns the leave object inside the standard `data` envelope.
- The student leave list and warden approval flows were already aligned with the backend contract.

## Fixes Applied
- Updated [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx) so the create-leave flow consumes the backend response correctly.
- Normalized response fields to support both `startDate/endDate` and `fromDate/toDate` in the frontend leave model.

## Notes
- The frontend base URL is expected to resolve `/v1/...` to `/api/v1/...`, which matches the backend router mount.
- No backend route changes were required.
