# Complaint Module Report

## Scope
This report reviews the complaint module across the backend routes, Prisma model, and the relevant student/admin/warden frontend screens.

No application code was modified.

## 1. Create complaint

### Backend support
- The backend exposes a complaint creation endpoint at POST /v1/complaints in [backend/src/modules/complaints/complaint.routes.ts](backend/src/modules/complaints/complaint.routes.ts).
- The controller in [backend/src/modules/complaints/complaint.controller.ts](backend/src/modules/complaints/complaint.controller.ts) passes the request to the service layer.
- The service in [backend/src/modules/complaints/complaint.service.ts](backend/src/modules/complaints/complaint.service.ts) creates a complaint record tied to the authenticated student profile.
- The request body is validated by [backend/src/modules/complaints/complaint.validation.ts](backend/src/modules/complaints/complaint.validation.ts) and requires fields such as category, subject, description, and optional priority/attachments.

### Frontend behavior
- The student complaint form in [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx) presents a submission UI and shows a success state.
- However, the form appears to be locally driven: it sets a submitted state and does not appear to call the backend complaint creation route.
- The student portal does load complaint history from the API during dashboard initialization, but the create flow is not visibly wired to the backend.

### Findings
- Backend create support exists and is protected by role-based access.
- Student-facing create flow is present in the UI, but the actual submission action appears to be mock-like rather than fully API-backed.

## 2. Update complaint

### Backend support
- The backend exposes PATCH /v1/complaints/:id in [backend/src/modules/complaints/complaint.routes.ts](backend/src/modules/complaints/complaint.routes.ts).
- The controller forwards the update to [backend/src/modules/complaints/complaint.service.ts](backend/src/modules/complaints/complaint.service.ts).
- The service supports updates to status, assignedTo, resolution, priority, and attachments.
- If the status is set to RESOLVED, the service also records resolvedBy and resolvedAt.

### Frontend behavior
- The admin dashboard in [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx) lists complaints from the backend.
- The warden complaint management page in [frontend/src/pages/warden/warden-complaint-management.tsx](frontend/src/pages/warden/warden-complaint-management.tsx) appears to be a static or mock-based UI and does not clearly call the update endpoint.

### Findings
- Backend update support exists and is suitable for staff/warden resolution workflows.
- The frontend does not appear to expose a complete, working update/resolution workflow for wardens or admins.

## 3. Status tracking

### Backend support
- The Prisma model in [backend/prisma/schema.prisma](backend/prisma/schema.prisma) defines complaint status with values such as OPEN, IN_PROGRESS, RESOLVED, CLOSED, and REJECTED.
- The service and validation support OPEN, IN_PROGRESS, and RESOLVED as updateable status values.

### Frontend behavior
- The student complaint tracking screen in [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx) renders complaint cards with status-based visual states.
- The complaint list is normalized from API data and shown as a tracked history view.
- The student dashboard summary in [frontend/src/context/fees.ts](frontend/src/context/fees.ts) also derives a pending complaint count from complaint records.

### Findings
- Status tracking is modeled in the backend and rendered in the student UI.
- The student flow is present, but the actual backend path used by the student portal appears inconsistent with the backend route definitions.

## 4. Resolution

### Backend resolution handling
- Resolution is handled through the update endpoint and stored in the complaint record.
- When a complaint is marked RESOLVED, the backend records:
  - status = RESOLVED
  - resolvedBy = current updater user ID
  - resolvedAt = current timestamp
  - resolution = supplied resolution text

### Frontend resolution experience
- The student UI displays a resolved-state timeline item when a complaint is resolved.
- The warden/admin experience for taking action and capturing a resolution note is not clearly implemented in the current frontend screens.

### Findings
- Backend support for resolution exists.
- End-to-end resolution workflow from staff action to visible student update is not fully demonstrated in the current UI.

## 5. Notifications

### Existing notification infrastructure
- The backend has a generic notification module in [backend/src/modules/notification/notification.routes.ts](backend/src/modules/notification/notification.routes.ts) and [backend/src/modules/notification/notification.service.ts](backend/src/modules/notification/notification.service.ts).
- The frontend uses the shared notification service in [frontend/src/services/api.ts](frontend/src/services/api.ts) to list and create notifications.

### Complaint integration status
- There is no evidence in the complaint module that a complaint submission, status change, or resolution automatically creates a notification.
- The complaint module does not appear to call the notification service when a complaint is created or updated.

### Findings
- The notification backend exists and is reusable.
- Complaint lifecycle events are not currently wired into notifications.

## 6. Overall assessment

The complaint module has the core backend pieces for submission, status updates, and resolution, but the current implementation is only partially connected to the frontend experience.

Main gaps:
- Complaint creation is not clearly wired to the student submission action in the UI.
- Complaint update/resolution workflows for wardens and admins are not fully surfaced in the frontend.
- Status tracking exists, but the student portal’s API path appears inconsistent with the backend route definitions.
- Complaint lifecycle events are not yet connected to notifications.
