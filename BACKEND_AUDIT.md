# Backend Audit

## Scope
This audit reviews only the backend application under [backend/src](backend/src) and its route/middleware/module structure. It focuses on missing endpoints, duplicate controllers/services, validation gaps, unused middleware, and unused routes.

## Missing endpoints
The main gap is that the student module exists but is not mounted in the API router, so its CRUD endpoints are effectively unreachable.

- [backend/src/modules/student/student.routes.ts](backend/src/modules/student/student.routes.ts) defines CRUD routes for students.
- [backend/src/routes/v1.router.ts](backend/src/routes/v1.router.ts) currently comments out the student router import and mounting.

Because of this, the backend does not expose student management endpoints through the versioned API even though the controller, service, and validation code already exist.

Other likely missing or incomplete endpoint surfaces include:
- no dedicated route for hostels, rooms, notices, reports, or fines even though the RBAC middleware defines permissions for them.
- the notification module is present, but it lacks explicit validation middleware for the create/read body and params.

## Duplicate controllers
No clear duplicate controllers were found in the backend module structure.

Each feature area uses a single controller file for its route handlers, such as:
- [backend/src/modules/attendance/attendance.controller.ts](backend/src/modules/attendance/attendance.controller.ts)
- [backend/src/modules/complaints/complaint.controller.ts](backend/src/modules/complaints/complaint.controller.ts)
- [backend/src/modules/fees/fees.controller.ts](backend/src/modules/fees/fees.controller.ts)
- [backend/src/modules/laundry/laundry.controller.ts](backend/src/modules/laundry/laundry.controller.ts)
- [backend/src/modules/leave/leave.controller.ts](backend/src/modules/leave/leave.controller.ts)
- [backend/src/modules/notification/notification.controller.ts](backend/src/modules/notification/notification.controller.ts)
- [backend/src/modules/student/student.controller.ts](backend/src/modules/student/student.controller.ts)
- [backend/src/modules/visitors/visitor.controller.ts](backend/src/modules/visitors/visitor.controller.ts)

## Duplicate services
No obvious duplicate service implementations were found.

Each module has a single service file for its business logic, and the service responsibilities are separated by feature area. The main overlap is architectural rather than duplicate code:
- [backend/src/modules/fees/fees.service.ts](backend/src/modules/fees/fees.service.ts) and [backend/src/modules/attendance/attendance.service.ts](backend/src/modules/attendance/attendance.service.ts) both perform domain-specific Prisma access and status mutation logic, but they are not duplicates of each other.

## Missing validation
Validation is present in most modules, but a few areas are weaker than the rest:

- [backend/src/modules/notification/notification.routes.ts](backend/src/modules/notification/notification.routes.ts) does not use validation middleware for the create-notification request body or the read-notification route param.
- [backend/src/modules/student/student.routes.ts](backend/src/modules/student/student.routes.ts) uses validation for params and body, but the student routes themselves are not mounted in [backend/src/routes/v1.router.ts](backend/src/routes/v1.router.ts).
- [backend/src/modules/auth/auth.routes.ts](backend/src/modules/auth/auth.routes.ts) uses validation for register/login, but the logout and refresh routes do not validate the presence of refresh-token-related input beyond controller checks.

The validation middleware itself is well-structured in [backend/src/middleware/validate.middleware.ts](backend/src/middleware/validate.middleware.ts), so the missing validation points are mostly route-level omissions rather than a missing framework.

## Unused middleware
The middleware layer is fairly complete, but a couple of pieces appear underutilized or only partially leveraged:

- [backend/src/middleware/rateLimiter.middleware.ts](backend/src/middleware/rateLimiter.middleware.ts) is applied globally in [backend/src/app.ts](backend/src/app.ts), so it is not unused.
- [backend/src/middleware/requestId.middleware.ts](backend/src/middleware/requestId.middleware.ts) is also applied globally in [backend/src/app.ts](backend/src/app.ts).
- [backend/src/modules/auth/auth.middleware.ts](backend/src/modules/auth/auth.middleware.ts) is only a re-export shim and does not add extra behavior.

The main middleware concern is not that a file is unused, but that some middleware helpers are not being applied consistently across routes. For example:
- RBAC is used in several modules, but the student routes are not mounted at all.
- The notification routes do not use the shared validation middleware even though the project already has it.

## Unused routes
The clearest unused route is the student route module:
- [backend/src/modules/student/student.routes.ts](backend/src/modules/student/student.routes.ts)

It is implemented but not mounted by [backend/src/routes/v1.router.ts](backend/src/routes/v1.router.ts), so its endpoints are not reachable.

Other route-related observations:
- [backend/src/routes/v1.router.ts](backend/src/routes/v1.router.ts) contains several commented-out route imports for planned modules such as users, hostels, rooms, fees, fines, notices, and reports.
- These are not currently unused files, but they indicate that the API surface is intentionally incomplete rather than fully implemented.

## Overall assessment
The backend is already organized around feature modules and uses a consistent route/controller/service/validation structure. The biggest concrete issue is that the student endpoints are implemented but not wired into the main API router. The next most important improvement would be to tighten validation around notification routes and expand route wiring for the modules that already have RBAC permissions defined but no active endpoints.
