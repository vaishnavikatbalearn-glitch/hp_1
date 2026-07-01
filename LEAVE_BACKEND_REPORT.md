# Leave Backend Report

## Scope
Reviewed the leave backend module only, covering controller, service, routes, validation, middleware, and Prisma usage.

## 1. Controller
File: backend/src/modules/leave/leave.controller.ts

### Observations
- The controller is thin and delegates business logic to the service layer.
- It uses the shared asyncHandler wrapper and the project response helpers.
- Request data is read from req.body and req.params and passed into the service.
- The controller formats leave responses into a consistent shape before sending them back.

### Notes
- The controller keeps the HTTP layer lightweight and avoids embedding business rules.
- It uses the authenticated user ID from the request for student-scoped operations.

## 2. Service
File: backend/src/modules/leave/leave.service.ts

### Observations
- The service handles creation, listing, approval, and rejection of leave requests.
- Creation checks for overlapping leave requests on the same student for pending/approved dates.
- Approval and rejection update the status and audit fields like approvedBy/rejectedBy and timestamps.
- The service also creates notifications for students, parents, and wardens.

### Strengths
- The overlap validation prevents conflicting leave periods.
- Status transitions are guarded to ensure only pending requests can be approved or rejected.
- Notification behavior is built in for both workflow changes and new submissions.

### Potential issues
- Notification delivery is wrapped in try/catch and silently swallowed, which can hide operational failures.
- The service uses a helper to resolve the student ID from the user ID, so it depends on the student mapping utility being correct.
- All notification logic is embedded directly in the service, which makes the service more complex than necessary.

## 3. Routes
File: backend/src/modules/leave/leave.routes.ts

### Observations
- The routes are mounted through the main v1 router and are protected by authentication and RBAC.
- The route set covers:
  - POST / (create leave)
  - GET /student (my leave requests)
  - GET /warden (pending leave requests for wardens)
  - PATCH /:id/approve
  - PATCH /:id/reject

### Notes
- Validation middleware is applied for request bodies and params where needed.
- RBAC permissions are enforced via the leave-specific permission keys.

## 4. Validation
File: backend/src/modules/leave/leave.validation.ts

### Observations
- Zod schemas are used for request validation.
- Create leave validation checks:
  - type as an allowed enum
  - startDate/endDate as valid dates
  - reason as a minimum-length string
  - destination as a non-empty string
  - contactNumber as a non-empty string
- A refinement ensures startDate is not after endDate.
- Reject leave validation requires a non-empty rejection reason.

### Notes
- Validation is present and appropriate for the leave flow.
- The schemas are simple and readable.

## 5. Middleware
Files reviewed:
- backend/src/middleware/authenticate.middleware.ts
- backend/src/middleware/validate.middleware.ts
- backend/src/middleware/rbac.middleware.ts

### Observations
- Authentication middleware verifies the access token and attaches the decoded user to req.user.
- Validation middleware parses and validates the request body/query/params using Zod.
- RBAC middleware enforces permission-based access for the leave routes.

### Notes
- The leave routes are correctly protected by authentication, validation, and permission middleware.

## 6. Prisma queries
File: backend/prisma/schema.prisma

### Observations
- The LeaveRequest model exists and includes fields for status, date range, reason, destination, contact details, approval/rejection metadata, and attachments.
- The model is mapped to the leaves table.
- Indexes exist for studentId/status and date range queries.

### Service query behavior
- createLeaveRequest uses findFirst to check for overlapping requests for the same student.
- getMyLeaveRequests uses findMany for the current student.
- getPendingLeaveRequests uses findMany with a pending status filter.
- approveLeaveRequest and rejectLeaveRequest use findUnique followed by update.

### Notes
- The Prisma schema is aligned with the service logic and the route expectations.

## 7. Summary
The leave backend module is structurally sound and follows the project’s conventions for controller-service-route layering. The main observations are:
- The module is well-structured and uses validation and RBAC correctly.
- Business rules such as overlap prevention and status transitions are enforced in the service layer.
- Notification side effects are implemented inline and could be separated later if the module grows.

No code changes were made; this report is for audit and review purposes.
