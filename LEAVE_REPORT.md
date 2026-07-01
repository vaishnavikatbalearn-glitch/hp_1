# Leave Module Report

## Scope
This report reviews the leave module across the backend leave flow, the database model, and the relevant frontend student/warden/parent pages.

No application code was modified.

## 1. Request flow

### Student request submission
- The student-facing leave request flow is wired in [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx).
- When a student submits a leave request, the UI calls the backend endpoint via the shared API layer using the path /v1/leave.
- The request body includes:
  - type
  - startDate
  - endDate
  - reason
  - destination
  - contactNumber

### Backend handling
- The route is defined in [backend/src/modules/leave/leave.routes.ts](backend/src/modules/leave/leave.routes.ts) and handled by the controller in [backend/src/modules/leave/leave.controller.ts](backend/src/modules/leave/leave.controller.ts).
- The request is protected by authentication and the leave:create permission in [backend/src/middleware/rbac.middleware.ts](backend/src/middleware/rbac.middleware.ts).
- The backend service in [backend/src/modules/leave/leave.service.ts](backend/src/modules/leave/leave.service.ts) performs three important checks before creating the request:
  1. It resolves the authenticated user to a student profile.
  2. It prevents overlapping leave dates for the same student when an existing request is PENDING or APPROVED.
  3. It creates a new leave record in the database.

### Result
- A new leave request is stored as a LeaveRequest record with a default status of PENDING.
- The student UI then adds the new request into the local history list so it appears immediately.

## 2. Approval flow

### Warden approval entry point
- The warden approval screen is implemented in [frontend/src/pages/warden/warden-leave-approvals.tsx](frontend/src/pages/warden/warden-leave-approvals.tsx).
- On load, it calls GET /v1/leave/warden to fetch pending leave requests.

### Approval action
- When the warden approves a request, the frontend sends PATCH /v1/leave/:id/approve.
- The backend route and controller are in [backend/src/modules/leave/leave.routes.ts](backend/src/modules/leave/leave.routes.ts) and [backend/src/modules/leave/leave.controller.ts](backend/src/modules/leave/leave.controller.ts).
- The backend service updates the request to:
  - status = APPROVED
  - approvedBy = current approver ID
  - approvedAt = current timestamp
  - clears any prior rejection fields

### User experience
- After success, the warden UI removes the request from the pending list and shows a success message.
- The student-side history view is not automatically refreshed in real time from the backend after approval; it relies on the next reload or a local update path in the student portal.

## 3. Rejection flow

### Rejection action
- The warden UI prompts for a rejection reason and then sends PATCH /v1/leave/:id/reject with the reason in the body.
- The backend validation schema in [backend/src/modules/leave/leave.validation.ts](backend/src/modules/leave/leave.validation.ts) requires a non-empty rejectionReason.

### Backend handling
- The backend service updates the request to:
  - status = REJECTED
  - rejectedBy = current rejector ID
  - rejectedAt = current timestamp
  - rejectionReason = supplied reason

### User experience
- Like approval, the warden UI removes the rejected request from the pending list and shows a success message.
- The rejection reason is persisted in the database and is available for future tracking.

## 4. Tracking

### Student tracking
- Student leave history is loaded from GET /v1/leave/student in [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx).
- The student portal normalizes the returned leave records and displays them in a leave history view with filters for all/approved/pending/rejected.

### Parent tracking
- The parent leave tracking page in [frontend/src/pages/parent/parent-leave-tracking.tsx](frontend/src/pages/parent/parent-leave-tracking.tsx) is currently static and uses hard-coded sample data.
- It does not currently call the backend leave endpoints for live tracking.

### Warden tracking
- The warden approval page acts as a pending-request queue rather than a complete history dashboard.
- It is focused on pending items and does not show a full historical or filterable leave ledger.

## 5. Notifications

### Existing notification infrastructure
- The backend includes a notification module in [backend/src/modules/notification/notification.routes.ts](backend/src/modules/notification/notification.routes.ts) and [backend/src/modules/notification/notification.service.ts](backend/src/modules/notification/notification.service.ts).
- The frontend also has notification pages for students, parents, and wardens that call the notification endpoints.

### Current leave integration status
- The leave module does not currently create or send leave-related notifications automatically when a leave is submitted, approved, or rejected.
- The approval and rejection actions in the warden UI only show local success/error messages.
- There is no evidence that the leave lifecycle is currently hooked into the notification subsystem.

### Practical impact
- Students and parents are not automatically notified when a leave request is approved or rejected.
- The leave flow is functional from a CRUD and approval standpoint, but it is not yet a fully event-driven workflow.

## 6. Database usage

The leave data model is defined in [backend/prisma/schema.prisma](backend/prisma/schema.prisma) as the LeaveRequest model.

### Stored fields
- studentId
- type
- status
- fromDate
- toDate
- reason
- destination
- contactAtLeave
- approvedBy / approvedAt
- rejectedBy / rejectedAt / rejectionReason
- parentConsent
- attachmentUrls

### Notes
- The schema supports the core workflow for submission, approval, and rejection.
- It does not appear to include a dedicated notification linkage or audit-history structure beyond the existing approval/rejection fields.

## 7. Overall assessment

The leave module is structurally functional and includes the main workflow pieces:
- request submission,
- warden approval,
- warden rejection,
- tracking for the student side,
- and backend persistence.

The main gaps are:
- parent-side tracking is still mock-driven,
- there is no automatic leave notification flow,
- and the warden experience is centered on pending requests rather than full leave management history.
