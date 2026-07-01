# Complaint Backend Report

## Scope
Reviewed the complaint backend module only, covering controller, service, routes, validation, middleware, and Prisma usage.

## 1. Controller
File: backend/src/modules/complaints/complaint.controller.ts

### Observations
- The controller is thin and delegates business logic to the service layer.
- It uses the shared asyncHandler wrapper and project response helpers.
- Request data is read from req.body, req.query, and req.params and passed into the service.
- The controller keeps the HTTP layer lightweight and consistent with the rest of the backend.

### Notes
- The controller uses the authenticated user ID from the request for student-specific operations.
- The controller does not perform business validation itself; validation is handled by middleware before the handler runs.

## 2. Service
File: backend/src/modules/complaints/complaint.service.ts

### Observations
- The service handles complaint creation, listing, detail/timeline retrieval, and updates.
- Complaint creation resolves the student ID from the authenticated user, creates the complaint record, and then triggers side-effect workflows.
- The service includes notification logic for wardens/admins, the student, and audit logging.
- Listing supports filtering by search text, status, category, priority, and assignedTo.
- Updates support status changes, assignment, resolution notes, priority, and attachment URLs.

### Strengths
- The create flow creates the complaint first and then performs side effects in a best-effort way.
- The list flow includes student details with enrollment and contact information for admin/warden use.
- Complaint updates record status changes and create audit entries for traceability.
- The timeline endpoint is backed by audit logs, which is useful for reviewing complaint history.

### Potential issues
- Notification and audit logging are wrapped in try/catch and silently swallowed, which can hide operational failures.
- The service embeds several side effects directly inside the business logic, making the module a bit heavier than necessary.
- The update logic relies on route-level authorization and does not enforce additional role-specific business rules itself.

## 3. Routes
File: backend/src/modules/complaints/complaint.routes.ts

### Observations
- The routes are mounted through the main v1 router under /complaints.
- Authentication and RBAC are applied to each route.
- Validation middleware is applied for request bodies and params.

### Notes
- The route set covers:
  - POST / (submit complaint)
  - GET /my (my complaints)
  - GET / (list complaints)
  - PATCH /:id (update complaint)
  - GET /:id/timeline (complaint timeline)

## 4. Validation
File: backend/src/modules/complaints/complaint.validation.ts

### Observations
- Zod schemas are used for request validation.
- Create complaint validation checks:
  - category as one of the allowed complaint categories
  - subject as a minimum-length string
  - description as a minimum-length string
  - priority as an integer between 1 and 3, optional
  - attachmentUrls as an optional array of valid URLs
- Update complaint validation checks:
  - status as one of OPEN, IN_PROGRESS, RESOLVED
  - assignedTo as a UUID, optional
  - resolution as an optional string
  - priority as an integer between 1 and 3, optional
  - attachmentUrls as an optional array of valid URLs

### Notes
- Validation is present and appropriate for the module.
- The schemas are straightforward and keep the controller focused on orchestration.

## 5. Middleware
Files reviewed:
- backend/src/middleware/authenticate.middleware.ts
- backend/src/middleware/validate.middleware.ts
- backend/src/middleware/rbac.middleware.ts

### Observations
- Authentication middleware verifies the access token and attaches the decoded user to req.user.
- Validation middleware parses and validates request data using Zod.
- RBAC middleware enforces permission-based access for complaint routes.

### Notes
- The complaint routes are correctly protected by authentication, validation, and permission middleware.

## 6. Prisma queries
File: backend/prisma/schema.prisma

### Observations
- The Complaint model exists and includes fields for student linkage, category, subject, description, status, priority, assignment, resolution, attachments, and timestamps.
- The model is mapped to the complaints table.
- An index exists for studentId and status.

### Service query behavior
- createComplaint creates a complaint record and resolves the student from the user.
- getMyComplaints fetches complaints for the current student.
- getAllComplaints builds a dynamic where clause and includes the related student profile for listing.
- updateComplaint loads the complaint, applies allowed updates, and writes the changes back.
- getComplaintTimeline reads audit logs for the complaint entity.

### Notes
- The Prisma schema is aligned with the service logic and the route expectations.

## 7. Summary
The complaint backend module is structurally sound and follows the project’s conventions for controller-service-route layering. The main observations are:
- The module is well-organized and uses validation and RBAC correctly.
- Complaint creation and update flows are backed by service logic and audit logging.
- Notification side effects are implemented inline and could be separated later if the module grows.

No code changes were made; this report is for audit and review purposes.
