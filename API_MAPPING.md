# API Mapping Report

## Scope
This report compares frontend API usage in [frontend/src](frontend/src) with the backend routes exposed by [backend/src/routes/v1.router.ts](backend/src/routes/v1.router.ts) and the feature route modules under [backend/src/modules](backend/src/modules).

## Connected APIs
The following frontend calls appear to align with backend routes.

| Frontend call | Backend route | Status | Notes |
|---|---|---|---|
| Student portal fee lookup via [frontend/src/services/api.ts](frontend/src/services/api.ts) | GET /api/v1/fees/student/:studentId | Connected | Matches [backend/src/modules/fees/fees.routes.ts](backend/src/modules/fees/fees.routes.ts) |
| Student portal fee history | GET /api/v1/fees/history/:studentId | Connected | Matches the fees router |
| Student portal pay fee | POST /api/v1/fees/payment | Connected | Matches the fees router |
| Student portal create visitor | POST /api/v1/visitor | Connected | Matches [backend/src/modules/visitors/visitor.routes.ts](backend/src/modules/visitors/visitor.routes.ts) |
| Warden visitor approvals list | GET /api/v1/visitor/warden | Connected | Matches the visitor router |
| Warden visitor approve/reject | PATCH /api/v1/visitor/:id/approve and /api/v1/visitor/:id/reject | Connected | Matches the visitor router |
| Admin dashboard pending fees | GET /api/v1/fees/pending | Connected | Matches the fees router |
| Admin dashboard attendance summary | GET /api/v1/attendance/summary | Connected | Matches [backend/src/modules/attendance/attendance.routes.ts](backend/src/modules/attendance/attendance.routes.ts) |
| Admin dashboard complaints | GET /api/v1/complaints | Connected | Matches [backend/src/modules/complaints/complaint.routes.ts](backend/src/modules/complaints/complaint.routes.ts) |
| Admin dashboard laundry | GET /api/v1/laundry | Connected | Matches [backend/src/modules/laundry/laundry.routes.ts](backend/src/modules/laundry/laundry.routes.ts) |
| Admin dashboard leave approvals | GET /api/v1/leave/warden | Connected | Matches [backend/src/modules/leave/leave.routes.ts](backend/src/modules/leave/leave.routes.ts) |
| Student portal leave submission | POST /api/v1/leave | Connected | Matches the leave router |
| Student portal leave history | GET /api/v1/leave/student | Connected | Matches the leave router |

## Missing or mismatched APIs
These frontend calls either do not match the backend shape or are likely to fail as written.

| Frontend call | Backend status | Issue |
|---|---|---|
| Student portal complaint history uses /v1/complaints/student | Not implemented | The backend exposes /complaints/my for the current user, not /complaints/student. |
| Notifications calls from [frontend/src/services/api.ts](frontend/src/services/api.ts) use the path notifications | Mismatch | The backend is mounted under /api/v1/notifications, so the frontend should likely call /v1/notifications rather than notifications. |
| Student portal notification create/read flows | Mismatch | They rely on the same notification path pattern and may be hitting the wrong URL prefix. |
| Student portal leave/complaint requests are partially wired | Partial | The frontend calls /v1/leave/student and /v1/complaints/student, but the backend uses /leave/student and /complaints/my. |
| Student CRUD flows | Not mounted | The student module exists in [backend/src/modules/student/student.routes.ts](backend/src/modules/student/student.routes.ts) but is not mounted in [backend/src/routes/v1.router.ts](backend/src/routes/v1.router.ts). |

## Unused backend routes
These backend routes are either not mounted or effectively not used by the current frontend.

| Backend route/module | Status | Notes |
|---|---|---|
| Student CRUD routes in [backend/src/modules/student/student.routes.ts](backend/src/modules/student/student.routes.ts) | Not exposed | The module exists but is commented out in [backend/src/routes/v1.router.ts](backend/src/routes/v1.router.ts). |
| Visitor alias route /api/v1/visitors | Redundant/duplicate | It points to the same router as /api/v1/visitor. |
| Commented-out router mounts in [backend/src/routes/v1.router.ts](backend/src/routes/v1.router.ts) | Planned only | Includes user, hostel, room, fine, notice, and report modules that are not active. |

## Frontend pages using mock data
These pages still show hard-coded sample arrays instead of live API-backed data.

| Page | Evidence | Notes |
|---|---|---|
| [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx) | Uses mockStudents, mockWardens, mockParents, mockTrustees, mockLaundryStaff, mockFines, mockRewards, and mockRoles | This is the clearest example of static/mock-driven UI in the frontend. |

## Overall assessment
The frontend and backend are partially aligned. The strongest connections are around fees, attendance, leave, and visitor workflows. The main gaps are the notification path prefix, the student route exposure, and the complaint endpoint shape used by the student portal.
