# Dashboard Audit Report

## Scope
This report reviews the main dashboard screens across the frontend for students, parents, wardens, admins, super admins, trustees, accountants, and laundry staff.

No application code was modified.

## Executive summary
Most dashboard pages are still presentation-focused shells rather than fully data-driven views. The strongest backend integration is in the admin dashboard, but even there several KPIs, trends, and activity widgets remain partially static or fallback-based.

## Overall findings
- Fake statistics are present in nearly every role-based dashboard.
- Hardcoded values appear in headers, quick stats, recent activity lists, and chart defaults.
- Several dashboards lack any real API integration for core metrics.
- Some dashboards include charts, but many are driven by static sample arrays rather than live data.
- Several useful widgets are missing, such as live alerts, upcoming tasks, and role-specific action panels.

## Dashboard-by-dashboard review

### 1. Student dashboard
File: [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx)

#### Fake statistics
- The hero banner shows a hardcoded presence state: “Present · Inside Hostel” and a hardcoded last-entry message.
- The dashboard uses static movement history from the local data array for the recent activity section.

#### Hardcoded values
- The “Last entry” and “Last exit” information is not derived from live movement records.
- The dashboard summary cards rely on values passed from local state, while some status text is fixed and static.
- The complaint submission screen shows a mock success state with a fake complaint ID.

#### Missing APIs
- No live API is used for current presence, last movement, or dynamic student status.
- The complaint submission flow does not appear to post to the complaint backend route.
- The dashboard does not pull a real recent-activity feed from the backend.

#### Missing charts
- There is no attendance trend chart on the student dashboard.
- There are no fee or leave trend charts.

#### Missing widgets
- No upcoming leave reminder widget.
- No due-fee alert widget.
- No real-time notifications or announcements widget.

### 2. Parent dashboard
File: [frontend/src/pages/parent/parent-dashboard.tsx](frontend/src/pages/parent/parent-dashboard.tsx)

#### Fake statistics
- The student profile card is filled with hardcoded values such as name, room number, enrollment number, and status.
- The notification badge shows a fixed value of 3.
- Recent activities are a static list.

#### Hardcoded values
- The parent dashboard uses a hardcoded local object for student details.
- The recent activity feed is static and not tied to attendance, leave, or movement events.
- The header summary uses placeholder-style content rather than a live student overview.

#### Missing APIs
- No live student profile API is used for the student card.
- No live recent activity stream is connected.
- The dashboard depends on the fees context, but the UI still presents a mostly static experience.

#### Missing charts
- No attendance trend chart.
- No fee trend chart.
- No leave or movement history chart.

#### Missing widgets
- No next-visit or upcoming leave widget.
- No fee due breakdown widget.
- No summary of unresolved complaints or pending approvals.

### 3. Warden dashboard
File: [frontend/src/pages/warden/warden-dashboard.tsx](frontend/src/pages/warden/warden-dashboard.tsx)

#### Fake statistics
- All core KPIs are hardcoded in the local stats object: total students, present students, absent students, pending complaints, pending visitors, leave requests, laundry, occupancy, and late entries.
- Recent activity items are static example entries.

#### Hardcoded values
- Attendance percentages are derived from local numbers rather than live attendance data.
- Occupancy text says “218 occupied out of 240 beds” even though the underlying data is local and not fetched from a room occupancy service.

#### Missing APIs
- No API calls are made for attendance, complaints, visitors, leave requests, or laundry workload.
- There is no live data binding for the pending-action cards.

#### Missing charts
- No chart for attendance trends.
- No chart for occupancy by block.
- No chart for complaints or leave lifecycle trends.

#### Missing widgets
- No live queue or escalation widget.
- No current incident/alert widget.
- No upcoming curfew or leave review panel.

### 4. Admin dashboard
File: [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx)

#### Fake statistics
- The initial dashboard state is seeded with values such as 342 students, 91% attendance, 85.5% occupancy, and 8 open complaints, even though these values are later replaced by API data.
- The header still shows a hardcoded date: “Friday, 20 June 2025”.
- The trend badges such as “+5” and “+8%” are static UI embellishments.

#### Hardcoded values
- The chart initial state uses placeholder data points such as “Today” before live data loads.
- The recent activity list is not driven by a live feed and appears to use built-in sample activity data.
- Several labels use fixed copy such as “Live data” rather than reflecting the actual loading state of the backend call.

#### Missing APIs
- The dashboard does not fetch live recent activity data or live notifications for the admin view.
- It does not fetch live alerts, upcoming maintenance tasks, or staff reminders.

#### Missing charts
- Charts for attendance and complaints are present, but there is no chart for room-level occupancy or fee recovery trend by category.

#### Missing widgets
- No pending approvals widget beyond a simple leave summary.
- No task/alert widget for urgent issues.
- No upcoming schedule or maintenance widget.

### 5. Super admin dashboard
File: [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx)

#### Fake statistics
- The dashboard uses static values such as 400 students, 85.5% occupancy, 91% attendance, 8 wardens, 248 parents registered, 4 trustees, and 6 laundry staff.
- Charts are driven by static mock arrays such as attendanceChartData and feeChartData.

#### Hardcoded values
- System health statuses such as “Healthy”, “Connected”, and “72% Used” are hardcoded UI values.
- The recent activity list is a static array.

#### Missing APIs
- No live system-health API is used.
- No live count API is used for students, roles, users, or platform metrics.
- No backend integration for storage, backup, or security health.

#### Missing charts
- No real-time infrastructure or security chart.
- No login-volume or API-error chart.

#### Missing widgets
- No server/resource usage widget.
- No active incidents widget.
- No backup/restore health widget tied to real status.

### 6. Trustee dashboard
File: [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx)

#### Fake statistics
- The main KPI strip uses fixed values such as “₹44L”, “342 students”, and “85% occupancy”.
- The stat cards use static values like 45 leave requests and 15 complaints for the month.

#### Hardcoded values
- The “Key Events” list is a fixed static list of governance-related events.
- The charts use static or sample data arrays rather than live metrics.

#### Missing APIs
- No live finance, occupancy, complaint, or attendance APIs are used for the dashboard.
- No live governance or board-report feed is connected.

#### Missing charts
- No chart for real-time hostel performance by department.
- No chart for trends across fee collection, occupancy, and attendance combined.

#### Missing widgets
- No board-alerts widget.
- No pending governance action widget.
- No upcoming compliance or inspection tracker.

### 7. Accountant dashboard
File: [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx)

#### Fake statistics
- The dashboard displays fixed values such as “₹2.7Cr total fees”, “₹44L collected”, and “₹6L pending”.
- The fine and reward totals are hardcoded.

#### Hardcoded values
- The pie and bar charts use static sample arrays.
- The fee status distribution is hardcoded into the chart data.
- The recent payment collection experience uses placeholder values.

#### Missing APIs
- No live backend integration for fee totals, pending dues, recent payments, fines, or rewards.
- The payment collection screen also uses placeholder values rather than real student/fee records.

#### Missing charts
- No chart for overdue balance trend or collection efficiency.
- No chart for payment method distribution.

#### Missing widgets
- No outstanding dues list widget.
- No payment reminder widget.
- No revenue forecast widget.

### 8. Laundry staff dashboard
File: [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx)

#### Fake statistics
- The dashboard shows hardcoded counts such as 18 pending, 8 processing, 12 ready, and 45 delivered.
- The “Today’s Summary” values are static.

#### Hardcoded values
- The weekly chart uses the local laundryChartData array rather than live operational counts.
- The summary values do not reflect a real-time queue from the laundry service.

#### Missing APIs
- No live laundry request count API is used.
- No live status update API is wired into the dashboard.

#### Missing charts
- No chart for turnaround time or pickup delays.
- No chart for per-staff performance.

#### Missing widgets
- No current pickup queue widget.
- No staff allocation widget.
- No urgent delivery alerts widget.

## Key gaps across dashboards
- The dashboards are mostly UI mocks with a few partially connected screens.
- The strongest live wiring exists in the admin dashboard, but even there many widgets remain static or fallback-driven.
- Role-specific dashboards need a shared data layer so each page can consume consistent backend metrics instead of local arrays or hardcoded values.
- Charting is present in some dashboards, but the underlying data source is often not live.
