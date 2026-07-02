**API Verification Report — Student Module**

Scope: verify endpoints used by `frontend/src/pages/student/StudentPortal.tsx` (Student module only).

Summary:
- Files inspected (frontend): `frontend/src/pages/student/StudentPortal.tsx`, `frontend/src/services/api.ts`.
- Files inspected (backend): controllers/routes/validation/service files for: complaints, laundry, notification, leave, fees, visitors, attendance. Also `backend/src/routes/v1.router.ts` for route wiring.

Verified endpoints (exists, request shape, response, error handling, loading):

1) GET /v1/auth/me
- Location: used by `StudentPortal` via `apiClient.get('/v1/auth/me')` (wrapped by `profileQuery`).
- Backend: auth module provides `auth/me` route (present in `v1.router` as `authRouter`). Backend controller returns authenticated user payload.
- Request body: none.
- Response shape: user/student payload. `StudentPortal` uses `normalizeProfile` to map fields: `id`, `name`, `enrollmentNumber|enrollment`, `room`, `leaveBalance`, `feeDue`, `feeDueDueDate`.
- Error handling: `useQuery` will set `isError` on failure; code uses `profileQuery.data` in useEffect to set profile; no explicit retry logic beyond React Query defaults.
- Loading: `staleTime: 60_000` used; component reads `profileQuery.data` to set state; loading indicator not explicit but UI tolerates missing fields.

2) GET /v1/leave/student
- Location: `leaveRequestsQuery` uses `apiClient.get('/v1/leave/student')`.
- Backend: `leave.routes.ts` exposes `GET /v1/leave/student` via `getStudentLeaves` controller.
- Request body: none.
- Response: array of leave records; backend `leave.controller` formats leaves with `startDate`, `endDate`, `status`, `createdAt`, etc. `StudentPortal` maps these via `normalizeLeave`.
- Validation: none client-side beyond `normalizeLeave`.
- Error handling/loading: `staleTime: 30_000`; `useEffect` maps data when available.

3) POST /v1/leave (create leave)
- Location: `handleLeaveRequestSubmit` originally used `api.post('/v1/leave', {...})` (raw client). Backend route `POST /v1/leave` exists (`createLeave`), and `createLeaveSchema` requires: `type` (optional enum), `startDate` (date), `endDate` (date), `reason` (min 10 chars), `destination` (min 1), `contactNumber`.
- Request shape: must match `CreateLeaveRequestBody` (see validation). Current code sends `type: 'HOME'`, `startDate`, `endDate`, `reason`, `destination`, `contactNumber` — matches validation (dates are strings; backend preprocesses strings to Date).
- Response: created leave object formatted by controller; UI normalizes it.
- Error handling/loading: code uses try/catch where invoked; `handleLeaveRequestSubmit` returns created object; `useQuery` for leave list will pick up new entries if invalidated.

4) GET /v1/complaints/my and POST /v1/complaints
- Location: `complaintsQuery` uses `/v1/complaints/my`; `MaintenanceScreen` and complaint creation use `apiClient.post('/v1/complaints', { category, subject, description, priority })`.
- Backend: `complaint.routes.ts` exposes `POST /v1/complaints` (validated by `createComplaintSchema`) and `GET /v1/complaints/my`.
- Request shape: `createComplaintSchema` requires `category` enum, `subject` string min 3, `description` min 10, optional `priority` number and `attachmentUrls`.
- Response: created complaint object; `list` returns array. UI maps fields via `normalizeComplaint`.
- Error handling/loading: `useQuery` for complaints uses `staleTime: 30_000`; creation catches errors and shows toast.

5) GET /v1/notifications, POST /v1/notifications, PATCH /v1/notifications/:id/read
- Location: `notificationsQuery` uses `getNotifications` service (which calls `/v1/notifications`); there were raw helpers using `apiClient`. I verified backend `notification.routes.ts` include `GET /`, `POST /`, and `PATCH /:id/read` (controller methods `getNotifications`, `createNotification`, `readNotification`).
- Request shapes:
  - GET: no body, returns array
  - POST: { title, body, type?, data? } — backend requires title & body.
  - PATCH /:id/read: no body (route marks as read in service).
- Response: Prisma `notification` records; `StudentPortal` normalizes fields.
- Error handling/loading: `notificationsQuery` uses `staleTime: 15_000`; UI has `handleMarkAllRead` which batched PATCHes and updates local state. Suggestion: prefer using `markNotificationAsRead` service and invalidate queries; current code uses raw apiClient but works.

6) GET /v1/laundry and POST /v1/laundry
- Location: `laundryQuery` uses `getLaundryRequests`; laundry request submission uses `apiClient.post('/v1/laundry', { items, notes })`.
- Backend: `laundry.routes.ts` exposes `POST /v1/laundry` (createLaundrySchema requires items array: [{name, qty}], optional notes), and `GET /v1/laundry` for listing.
- Request shape: UI builds `items: [{ name, qty }, ...]` and `notes`; matches validation.
- Response: created laundry request or list of requests. UI maps to history entries.
- Error handling/loading: `staleTime: 15_000`; submission wrapped with try/catch and query invalidation.

7) Fees endpoints: GET /v1/fees/student/:studentId, GET /v1/fees/history/:studentId, POST /v1/fees/payment
- Location: `getFeeDetails(studentId)`, `getPaymentHistory(studentId)`, `payFee(...)` call the above.
- Backend: `fees.routes.ts` exposes `GET /student/:studentId`, `GET /history/:studentId`, and `POST /payment` with validation `paymentCreateSchema` (feeRecordId uuid, amount positive, method enum, receiptNumber, optional transactionId/notes).
- Response: FeeRecord and PaymentRecord models exist. UI uses `uniqueFeeRecords()` and `getRecordStatus()` to derive UI.
- Error handling/loading: `feeQuery` uses `staleTime: 30_000`, handles isLoading/isError states and shows messages; `payFee` call is wrapped in try/catch and invalidates queries.

8) GET /v1/events and GET /v1/notices
- Location: `eventsQuery` calls `getEvents` service; `noticesQuery` calls `getNotices`.
- Backend: v1 router shows commented-out registration for `notices` and `events` in `v1.router.ts` (routes appear to be not mounted). However the `services/api.ts` provides `getNotices()` and `getEvents()` wrappers expecting `v1/notices` and `v1/events` endpoints.
- Verification: I could not find `modules/notices` or `modules/events` controllers/routes in backend source (route registration commented out). That implies `GET /v1/notices` and `GET /v1/events` may not be available in this backend build.
- Impact: UI calling these will receive 404 (or route not defined). Currently `StudentPortal` maps `noticesQuery.data` and `eventsQuery.data` into UI lists — if backend lacks routes, these queries will fail.
- Suggestion: either enable backend modules or handle missing routes gracefully (safeApiCall or try/catch) in frontend.

9) Fines & Rewards endpoints (/v1/fines, /v1/rewards)
- Location: `getFines()` and `getRewards()` exist in `services/api.ts` wrappers.
- Backend: `v1.router.ts` has commented-out registration for `fines` and `notices` (`// v1Router.use('/fines', finesRouter);`). I could not find a `modules/fines` folder.
- Impact: endpoints likely absent; UI uses local mock `fines` and `rewards` arrays; calls to `getFines()` would 404.

10) Visitor endpoints (/v1/visitor)
- Location: `createVisitorRequest()` uses `v1/visitor` POST, and `getParentVisitorRequests()` uses `v1/visitor/student`.
- Backend: `visitor.routes.ts` defines `POST /` and `GET /student`/`/warden` and PATCH approve/reject — route is registered as `v1Router.use('/visitor', visitorRouter);` in `v1.router.ts` (also `v1Router.use('/visitors', visitorRouter);`). Verified.
- Request shape: `createVisitorSchema` requires `visitorName`, `visitorPhone` and `expectedDate`; UI sends `visitorName`, `visitorPhone`, `relation`, `purpose`, `expectedDate`, `expectedDuration` — acceptable.
- Response: created visitor record; UI maps returned `expectedDate`.

11) Attendance endpoints (/v1/attendance/*)
- Location: `authService.getAttendanceSummary()` and `authService.markAttendance()` called by `StudentPortal`.
- Backend: attendance routes exist (`/v1/attendance/mark`, `/v1/attendance/summary`, `/v1/attendance/stud/:studentId`, `/v1/attendance/today`). Controller/service return summary and lists.
- Request shapes: markAttendance expects body { studentId, status, remarks } validated in `attendance.validation.ts` (status enum), backend uses `markAttendanceSchema`.
- Response: standard envelope with data; UI extracts `.data` or uses `authService` result directly.

Notes on raw apiClient usage found in `StudentPortal`:
- Several places used `apiClient.get/post/patch` directly (notifications loader, complaint submit, laundry submit, leave creation). In many places these have been replaced with service wrappers, but a few raw usages remain (complaint create and laundry post). They match backend validation shapes.

Loading state handling review:
- Most queries use React Query `useQuery` with sensible `staleTime`s. UI components check `isLoading` or `isFetching` where needed (fees, attendance). Some UI parts assume data once mapped via useEffect and do not render explicit spinners; behavior is acceptable.
- POST actions (leave, complaints, laundry, fee payment) wrap calls in try/catch and use local `submitting` booleans.

Error handling review:
- API wrappers (`services/api.ts`) throw ApiError; where frontend used `apiClient` directly the code handles with try/catch and toast messages.
- A few queries do not check `isError` explicitly (profile), but they guard with optional chaining.

Outstanding issues found:
- `GET /v1/notices`, `GET /v1/events`, `GET /v1/fines`, `GET /v1/rewards` appear to not be mounted in the backend (route registration commented out). Frontend calls exist and will fail with 404. Frontend should handle missing endpoints gracefully (safeApiCall) or the backend should enable these modules.
- Some raw `apiClient` calls remain; migrating to `services/api` wrappers improves typing and consistent error handling.

Recommendation summary:
- For endpoints present in backend (auth/me, leave, complaints, notifications, laundry, fees, visitor, attendance), the StudentPortal calls match request shapes and response mapping is correct. Loading & error handling is appropriate overall.
- For endpoints not registered in backend (notices, events, fines, rewards), either enable backend modules or wrap frontend calls with safeApiCall and render empty states.

Next step: produce `API_VERIFICATION_REPORT.md` file (this document) saved at project root.

