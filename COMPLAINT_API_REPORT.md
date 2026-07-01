# Complaint API Report

## Scope
- Review backend complaint API routes for create, list, update, timeline, status, resolution, search, and filters.
- Compare those routes with frontend complaint usage.
- Fix endpoint mismatches only.

## Backend Complaint Routes
The backend complaint module exposes these routes under `/api/v1/complaints`:

- `POST /api/v1/complaints/`
  - Creates a complaint.
  - Requires `complaint:create` permission.
  - Expects body fields: `category`, `subject`, `description`, optional `priority`, optional `attachmentUrls`.
- `GET /api/v1/complaints/my`
  - Returns complaints for the authenticated student.
  - Requires `complaint:read` permission.
- `GET /api/v1/complaints/`
  - Lists complaints with optional query filters.
  - Supported query params: `search`, `status`, `category`, `priority`, `assignedTo`.
- `PATCH /api/v1/complaints/:id`
  - Updates a complaint.
  - Supports `status`, `assignedTo`, `resolution`, `priority`, and `attachmentUrls`.
- `GET /api/v1/complaints/:id/timeline`
  - Returns complaint audit history.

## Frontend Complaint Usage
Frontend complaint calls were found in:

- [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx)
  - Reads `GET /v1/complaints/my`
  - The complaint submission UI previously did not call the backend create endpoint.
- [frontend/src/pages/warden/warden-complaint-management.tsx](frontend/src/pages/warden/warden-complaint-management.tsx)
  - Uses `GET /v1/complaints` for listing and filtering.
  - Uses `PATCH /v1/complaints/:id` for status updates.
  - Uses `GET /v1/complaints/:id/timeline` for complaint timeline.
- [frontend/src/services/api.ts](frontend/src/services/api.ts)
  - Uses the same route contract for list, update, and timeline.

## Findings
- The complaint route paths already matched the backend contract for listing, update, timeline, and student complaint history.
- The student complaint form was not submitting to the backend create endpoint, so the complaint create flow was effectively disconnected from the API.

## Fixes Applied
- Updated [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx) so the student complaint form now calls `POST /v1/complaints` with the expected backend payload.
- The form now maps the UI fields to backend fields:
  - `category: MAINTENANCE`
  - `subject`
  - `description`
  - `priority`

## Notes
- The frontend already used the correct endpoints for:
  - create (after the fix)
  - update
  - timeline
  - status/resolution handling
  - search and filters
- No backend route changes were necessary.
