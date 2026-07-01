# Routing Audit Report

## Scope
This report reviews the frontend routing system for broken routes, duplicate or overlapping routes, missing routes, lazy loading, and protected-route coverage.

No application code was modified.

## Executive summary
The project currently uses more than one routing approach, but the main application entrypoint is not using the central browser router. The route configuration that exists in the dedicated router file is effectively disconnected from the app shell, which makes the routing system inconsistent and partially non-functional.

## Findings

### 1. Broken routes
The main route configuration is defined in [frontend/src/routes/index.tsx](frontend/src/routes/index.tsx), but the app is bootstrapped through [frontend/src/main.tsx](frontend/src/main.tsx), which renders [frontend/src/App.tsx](frontend/src/App.tsx) instead of mounting the router.

This means:
- The browser router in [frontend/src/routes/index.tsx](frontend/src/routes/index.tsx) is not mounted at runtime.
- The URL-based navigation paths such as /parent, /warden, /admin, and /student are not being driven by that router.
- Routes defined there are effectively inert unless the app is reworked to use RouterProvider.

### 2. Duplicate or overlapping routes
The project has overlapping routing strategies:
- [frontend/src/routes/index.tsx](frontend/src/routes/index.tsx) defines a central browser router for parent, warden, and staff routes.
- [frontend/src/pages/parent/ParentPortal.tsx](frontend/src/pages/parent/ParentPortal.tsx) defines its own internal route set for /parent* using MemoryRouter.
- [frontend/src/pages/warden/WardenPortal.tsx](frontend/src/pages/warden/WardenPortal.tsx) defines its own internal route set for /warden* using MemoryRouter.

This creates overlapping route responsibilities:
- The same URL namespaces are handled by different routing layers.
- The app has both route-driven navigation and component-driven screen switching.
- The architecture is harder to reason about and easier to break during future changes.

### 3. Missing routes
Several navigation flows are present in the UI, but they are not represented as true routes in the active application shell.

Examples:
- The student experience in [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx) uses internal screen state via onNavigate and does not expose URL-based routes for screens such as profile, movement, complaints, leave history, and laundry request.
- The current app shell in [frontend/src/App.tsx](frontend/src/App.tsx) switches between whole portals using local role state rather than route-based rendering.
- There is no dedicated route layer for student sub-screens, so deep links into the student flow are missing.

### 4. Lazy loading
No lazy loading is currently implemented for route-based screens.

Evidence:
- A search of the frontend source found no usage of React.lazy or lazy() for route components.

Impact:
- Initial bundle size is larger than it needs to be.
- Route-based code splitting is not being used.

### 5. Protected routes
There is no protected-route layer in the active routing system.

Evidence:
- The app does not mount a guard component around role-based routes.
- The routing setup does not enforce authentication or role authorization.
- There is an auth-integration sample in [frontend/src/auth-integration/src/app/routes.config.tsx](frontend/src/auth-integration/src/app/routes.config.tsx), but it is not wired into the main app.

Impact:
- Any role-based route can be reached without a real auth gate.
- The app relies on local UI state instead of enforced route protection.

## Route coverage summary

### Routes that exist in the central router
Defined in [frontend/src/routes/index.tsx](frontend/src/routes/index.tsx):
- / 
- /auth
- /student
- /parent
- /parent/attendance
- /parent/movement-history
- /parent/leave-tracking
- /parent/fees-tracking
- /parent/fines-rewards
- /parent/notifications
- /parent/notice-board
- /parent/event-gallery
- /parent/student-overview
- /parent/settings
- /warden
- /warden/students
- /warden/students/:id
- /warden/parent-photo-view/:id
- /warden/face-enrollment/:id
- /warden/attendance
- /warden/movement
- /warden/absentee
- /warden/curfew
- /warden/curfew-extensions
- /warden/leave-approvals
- /warden/rooms
- /warden/floors
- /warden/capacity
- /warden/complaints
- /warden/laundry
- /warden/visitors
- /warden/fines
- /warden/rewards
- /warden/notice-board
- /warden/events
- /warden/initiatives
- /warden/reports
- /warden/notifications
- /superadmin
- /admin
- /trustee
- /accountant
- /laundry

### Routes that are effectively active in the current app shell
The current app shell in [frontend/src/App.tsx](frontend/src/App.tsx) switches between portals using local role state rather than routes. That means the visible flow is based on state transitions, not URL routing.

## Recommendations
1. Choose one routing strategy for the app shell and remove or consolidate the others.
2. Mount the central browser router from [frontend/src/routes/index.tsx](frontend/src/routes/index.tsx) through [frontend/src/main.tsx](frontend/src/main.tsx).
3. Add route-level auth and role guards for protected screens.
4. Introduce lazy loading for larger portal modules.
5. Add URL-based routing for the student portal sub-screens so deep links are possible.
