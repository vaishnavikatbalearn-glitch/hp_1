# Frontend API Integration Audit

## Overview

This audit covers the frontend integration readiness of `frontend/src/pages` and the existing API scaffolding in `frontend/src/services/api.ts`.

Findings:
- `frontend/src/services/api.ts` is implemented as a generic API wrapper, but the page files under `frontend/src/pages` do not use it.
- The only real backend integration present is in `frontend/src/auth-integration`, not in the main page-driven app screens.
- Most pages use hardcoded mock arrays, local state, submit-state toggles, and navigation-only buttons instead of actual network requests.

## Current State by Area

### 1. Auth Flow

File: `frontend/src/pages/auth/AuthFlow.tsx`
- Screens: login, forgot password, OTP verification, registration steps, profile completion, emergency contacts, document upload.
- Current behavior: local form state and validation, static `ROLES` and `DOCS`, simulated upload state with `setTimeout`, no network calls.
- Required backend endpoints:
  - `POST /auth/login`
  - `POST /auth/forgot-password`
  - `POST /auth/verify-otp`
  - `POST /auth/register`
  - `PUT /auth/profile` or `POST /auth/profile`
  - `POST /auth/documents` (multipart/file upload)
  - `POST /auth/emergency-contacts`
- Integration comments:
  - High priority: auth is the entry point for all user roles.
  - Complexity: medium because registration includes multi-step form state, contact management, and document upload.

### 2. Student Portal

File: `frontend/src/pages/student/StudentPortal.tsx`
- This file contains the entire student portal UI and is almost entirely mock-driven.
- Data arrays defined in module scope:
  - `attendanceData`, `movementData`, `student`, `leaveHistory`, `fees`, `fines`, `laundryHistory`, `complaints`, `notices`, `events`, `initiatives`, `notifications`
- Screens and behaviors using mock data / local state:
  - Dashboard: static attendance charts, quick actions, status cards, recent activity cards.
  - Attendance: static attendance chart data.
  - Movement: local movement history.
  - Leave Request: form submission only triggers `setSubmitted(true)` and does not call an API.
  - Leave History: filters against static `leaveHistory`.
  - Curfew Extension: form submission only toggles UI state.
  - Fees: static totals, static fee rows, payment buttons do not call backend.
  - Fines & Rewards: static `fines` array.
  - Maintenance/Complaint Request: form submission toggles local state and uses static complaint tracking.
  - Laundry Request: local item counters and request submission state only.
  - Visitor Request: static recent requests and a local form state only.
  - Mess Menu: static meal menus.
  - Notices: static notice data.
  - Events: static event list and buttons with no network logic.
  - Initiatives: static initiative cards, no filtering or API integration.
  - Feedback: local rating form and submit toggle only.
  - Notifications: static notification list.
  - Settings/Profile/Emergency Contacts: static user and contact data.
- Required backend endpoints:
  - `GET /student/profile`
  - `PUT /student/profile`
  - `GET /student/attendance`
  - `GET /student/movement-history`
  - `POST /student/leave-requests`
  - `GET /student/leave-history`
  - `POST /student/curfew-requests`
  - `GET /student/curfew-requests`
  - `GET /student/fees`
  - `POST /student/fees/pay`
  - `GET /student/receipts`
  - `GET /student/fines-rewards`
  - `POST /student/maintenance-requests`
  - `GET /student/complaints`
  - `POST /student/laundry-requests`
  - `GET /student/laundry-history`
  - `POST /student/visitor-requests`
  - `GET /student/visitor-requests`
  - `GET /student/mess-menu`
  - `GET /student/notices`
  - `GET /student/events`
  - `GET /student/initiatives`
  - `POST /student/initiatives/join`
  - `POST /student/feedback`
  - `GET /student/notifications`
- Integration comments:
  - Highest priority on request forms (leave, curfew, maintenance, laundry, visitor, feedback) because they currently do not persist anywhere.
  - Dashboard data and notifications should be wired to live student backend endpoints.
  - Profile/settings should be connected to authenticated student data.

### 3. Admin Portal

File: `frontend/src/pages/admin/StaffPortal.tsx`
- Current behavior: uses many mock arrays and static datasets for staff, charts, complaints, laundry requests, fines, rewards, reports, and roles.
- No page-level API calls were detected.
- Required backend endpoints:
  - `GET /admin/dashboard`
  - `GET /admin/staff`
  - `GET /admin/wards`
  - `GET /admin/complaints`
  - `GET /admin/laundry-requests`
  - `GET /admin/fines`
  - `GET /admin/rewards`
  - `GET /admin/audit-logs`
  - `GET /admin/reports`
  - `GET /admin/roles`
  - `POST /admin/payments`
  - `POST /admin/notifications`
- Integration comments:
  - This page is a large dashboard with strong mock coverage; it should be treated as a major backend wiring task.
  - Priority is medium-high if the admin panel is part of MVP delivery.

### 4. Parent Portal

Files and behavior:
- `frontend/src/pages/parent/parent-dashboard.tsx`
  - Static `studentData` and `recentActivities`, navigation-only cards.
- `frontend/src/pages/parent/parent-attendance.tsx`
  - Static `attendanceData` and `monthlyAttendance`.
- `frontend/src/pages/parent/parent-fees-tracking.tsx`
  - Static `feesData`, `paymentHistory`, `upcomingDues`.
- `frontend/src/pages/parent/parent-leave-tracking.tsx`
  - Static `leaveRequests`.
- `frontend/src/pages/parent/parent-movement-history.tsx`
  - Static `movementHistory`.
- `frontend/src/pages/parent/parent-notice-board.tsx`
  - Static `notices`.
- `frontend/src/pages/parent/parent-notifications.tsx`
  - Static `notifications`.
- `frontend/src/pages/parent/parent-event-gallery.tsx`
  - Static `events`.
- `frontend/src/pages/parent/parent-fines-rewards.tsx`
  - Static `fines` and `rewards`.
- `frontend/src/pages/parent/parent-student-overview.tsx`
  - Static `studentData`.
- `frontend/src/pages/parent/parent-settings.tsx`
  - Static `parentData` and navigation only.
- `frontend/src/pages/parent/ParentPortal.tsx`
  - Top-level wrapper with logout/navigation.
- Required backend endpoints:
  - `GET /parent/dashboard`
  - `GET /parent/student/attendance`
  - `GET /parent/student/fees`
  - `GET /parent/student/leave-requests`
  - `GET /parent/student/movement-history`
  - `GET /parent/notices`
  - `GET /parent/notifications`
  - `GET /parent/events`
  - `GET /parent/fines-rewards`
  - `GET /parent/student-overview`
  - `PUT /parent/settings`
- Integration comments:
  - Parent screens are largely informational and should be connected to the corresponding student/ward backend data.
  - Navigation currently exists, but content is stubbed everywhere.

### 5. Warden Portal

Files and behavior:
- `frontend/src/pages/warden/WardenPortal.tsx` — top-level warden shell.
- `frontend/src/pages/warden/warden-dashboard.tsx` — large dashboard with live stat cards and navigation shortcuts.
- `frontend/src/pages/warden/warden-absentee-list.tsx` — static `absentees` array.
- `frontend/src/pages/warden/warden-attendance-monitoring.tsx` — static attendance stats.
- `frontend/src/pages/warden/warden-capacity-management.tsx` — static `rooms`.
- `frontend/src/pages/warden/warden-complaint-management.tsx` — static `complaints`.
- `frontend/src/pages/warden/warden-curfew-extensions.tsx` — static `requests`.
- `frontend/src/pages/warden/warden-curfew-management.tsx` — navigation-only page.
- `frontend/src/pages/warden/warden-event-management.tsx` — static event list.
- `frontend/src/pages/warden/warden-face-enrollment.tsx` — navigation-only / student routing.
- `frontend/src/pages/warden/warden-fine-management.tsx` — static fines/rewards.
- `frontend/src/pages/warden/warden-floor-management.tsx` — static room layout.
- `frontend/src/pages/warden/warden-initiative-moderation.tsx` — static initiative cards.
- `frontend/src/pages/warden/warden-laundry-monitoring.tsx` — static laundry data.
- `frontend/src/pages/warden/warden-leave-approvals.tsx` — static leave approval rows.
- `frontend/src/pages/warden/warden-movement-monitoring.tsx` — static movement stats.
- `frontend/src/pages/warden/warden-noticeboard-management.tsx` — static notice board.
- `frontend/src/pages/warden/warden-notifications.tsx` — static notifications.
- `frontend/src/pages/warden/warden-parent-photo-view.tsx` — static photo detail.
- `frontend/src/pages/warden/warden-reports.tsx` — static report cards.
- `frontend/src/pages/warden/warden-reward-management.tsx` — static reward data.
- `frontend/src/pages/warden/warden-room-management.tsx` — static room management.
- `frontend/src/pages/warden/warden-student-details.tsx` — static student detail/links.
- `frontend/src/pages/warden/warden-student-management.tsx` — static student table.
- `frontend/src/pages/warden/warden-visitor-approvals.tsx` — static visitor approval list.
- Required backend endpoints:
  - `GET /warden/dashboard`
  - `GET /warden/absentees`
  - `GET /warden/attendance`
  - `GET /warden/room-capacity`
  - `GET /warden/complaints`
  - `PATCH /warden/complaints/:id`
  - `GET /warden/curfew-extensions`
  - `PATCH /warden/curfew-extensions/:id`
  - `GET /warden/events`
  - `POST /warden/events`
  - `GET /warden/fines`
  - `GET /warden/initiatives`
  - `PATCH /warden/initiatives/:id`
  - `GET /warden/laundry-requests`
  - `GET /warden/leave-requests`
  - `PATCH /warden/leave-requests/:id`
  - `GET /warden/movement-history`
  - `GET /warden/notices`
  - `POST /warden/notices`
  - `GET /warden/students`
  - `GET /warden/students/:id`
  - `GET /warden/visitor-requests`
  - `PATCH /warden/visitor-requests/:id`
- Integration comments:
  - Warden features are mostly stubbed and require endpoint wiring for each management area.
  - The portal is navigable, but the content is static across almost every page.

## Shared Integration Gaps

- The existing API helper in `frontend/src/services/api.ts` is currently unused by the instrumented page files.
- No page under `frontend/src/pages` currently imports or calls `apiGet`, `apiPost`, `apiPut`, or `apiDelete`.
- No React Query or axios-based data fetching patterns are present in the page files under `frontend/src/pages`.
- Most forms use `setSubmitted(true)` to simulate success rather than sending data to the backend.
- Many navigation buttons only call `navigate(...)` with no API fetch or save behavior.

## Priority Matrix

1. High priority
   - `frontend/src/pages/auth/AuthFlow.tsx`
   - `frontend/src/pages/student/StudentPortal.tsx` request forms: leave, curfew, maintenance, laundry, visitor, feedback
   - `frontend/src/pages/student/StudentPortal.tsx` profile / notifications / fees / attendance data
   - `frontend/src/pages/admin/StaffPortal.tsx` dashboard data and staff/complaint/payment wiring

2. Medium priority
   - `frontend/src/pages/parent/*` pages for ward attendance, fees, leave, movement, notices, notifications
   - `frontend/src/pages/warden/*` pages for complaints, leave approvals, visitor approvals, laundry monitoring, absentees

3. Low priority
   - static informational pages such as `parent-event-gallery.tsx`, `warden-event-management.tsx`, `warden-noticeboard-management.tsx`, `mess`, `events`, `initiatives`
   - navigation wrappers and layout-only pages such as `ParentPortal.tsx`, `WardenPortal.tsx`

## Recommendations

- Start by wiring the main auth flow to backend auth endpoints.
- Next, connect the student portal forms and dashboard to live data using `frontend/src/services/api.ts` or an API client pattern.
- After student flows are integrated, wire parent and warden pages to their respective backend endpoints.
- Replace mock arrays with real API response data and use loading / error states for network requests.
- Standardize on one data-fetching pattern; `apiGet` / `apiPost` is available and should be adopted in `frontend/src/pages`.
- Add a small integration checklist for each page:
  1. Replace hardcoded sample data with `GET` endpoint.
  2. Wire form submit buttons to `POST`/`PUT` endpoints.
  3. Replace `setSubmitted(true)` and local toggles with backend success/failure handling.
  4. Keep UI navigation controls, but make data depend on real backend state.

## Conclusion

The frontend contains a full UI shell, but the majority of `frontend/src/pages` are still mock-driven. A backend integration pass is required across auth, student, parent, warden, and admin flows. The API wrapper exists, but pages must be refactored to call real endpoints and remove hardcoded sample data.
