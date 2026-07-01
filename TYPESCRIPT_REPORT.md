# TypeScript Audit Report

## Scope
This report reviews the TypeScript codebase for reusable types, duplicate interfaces, unsafe casts, and unnecessary type assertions.

No application code was modified.

## Executive summary
The codebase contains a substantial amount of TypeScript, but several areas rely on broad or unsafe typing patterns. The most important issues are repeated local shapes, use of any and unknown casts, and type assertions that could be replaced with stronger, more explicit types.

## Findings

### 1. Reusable types and shared interfaces
The frontend already defines some useful shared interfaces in [frontend/src/services/api.ts](frontend/src/services/api.ts), including:
- FeeRecord
- PaymentRecord
- PayFeePayload
- VisitorRequest
- CreateVisitorPayload
- NotificationItem

These are a good foundation and are reused by the fees context and some portal screens.

However, several page-level components still define their own ad-hoc shapes rather than reusing shared contracts. Examples include:
- [frontend/src/pages/parent/parent-student-overview.tsx](frontend/src/pages/parent/parent-student-overview.tsx) defines its own StudentProfileData interface.
- [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx) uses many inline object literals and local arrays without corresponding exported types.
- [frontend/src/hooks/useAuth.ts](frontend/src/hooks/useAuth.ts) defines its own AuthState despite the app already having auth-related models elsewhere.

### 2. Duplicate or overlapping interfaces
There are some duplicate or near-duplicate interface patterns across the frontend:
- The auth integration area contains its own login/register payload and user types in [frontend/src/auth-integration/src/auth/types.ts](frontend/src/auth-integration/src/auth/types.ts), while the main app also has auth-related state and props in [frontend/src/hooks/useAuth.ts](frontend/src/hooks/useAuth.ts) and [frontend/src/pages/auth/AuthFlow.tsx](frontend/src/pages/auth/AuthFlow.tsx).
- The two login screen components in [frontend/src/auth-integration/screens/LoginScreen.tsx](frontend/src/auth-integration/screens/LoginScreen.tsx) and [frontend/src/auth-integration/src/screens/LoginScreen.tsx](frontend/src/auth-integration/src/screens/LoginScreen.tsx) define the same props shape separately.

This duplication increases maintenance overhead and makes it easier for the UI to drift from the API contracts.

### 3. Unsafe casting
Several files rely on casts that weaken type safety.

High-signal examples:
- [backend/src/modules/auth/auth.service.ts](backend/src/modules/auth/auth.service.ts)
  - Uses any for the user input mapping and for Prisma create/update payloads.
  - Uses casts such as (user as any) and (user.role as unknown) as Role.
  - The code is functional, but the typing is much weaker than the underlying data model.

- [backend/src/modules/complaints/complaint.service.ts](backend/src/modules/complaints/complaint.service.ts)
  - Uses a local updateData: any object for building partial update payloads.
  - This avoids compile-time validation but reduces confidence in the update shape.

- [backend/src/modules/leave/leave.controller.ts](backend/src/modules/leave/leave.controller.ts)
  - Uses a formatter that accepts any and then reads arbitrary properties from it.

- [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx)
  - Uses any in several state definitions and normalization helpers such as monthlyAttendance, normalizeAttendanceRecord, normalizeLeave, and normalizeComplaint.
  - Uses type assertions such as id as Screen and screen as Screen in multiple places.

- [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx)
  - Uses many casts such as attendanceChartData as any, attendanceSummary as any, and occupancyChartPointsLocal as any.
  - The chart data shapes are already fairly structured, so these casts appear to be compensating for weakly typed data rather than modeling the actual shape properly.

### 4. Unnecessary or avoidable type assertions
Some assertions are present even though the compiler could infer the type from the surrounding context.

Examples:
- [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx)
  - Uses explicit assertions like id as Screen and screen as Screen when the values are already known to be drawn from a typed union.
  - The repeated pattern suggests the screen union could be modeled more centrally and reused.

- [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx)
  - Uses label as string, val as boolean, and fn as () => void in several map callbacks.
  - These are likely compensating for a loosely typed array structure and can often be simplified by using a typed array or a typed helper.

- [backend/src/middleware/validate.middleware.ts](backend/src/middleware/validate.middleware.ts)
  - Uses (req as unknown as Record<string, unknown>) to mutate request fields.
  - This is broad and could be reduced by introducing a more specific request-type helper.

### 5. Broad object and response typing
Some modules are using very generic response types where more specific types would improve clarity.

Examples:
- [frontend/src/pages/parent/parent-student-overview.tsx](frontend/src/pages/parent/parent-student-overview.tsx)
  - Uses a broad payload retrieved from api.get('/auth/me') as any and then manually transforms it.
- [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx)
  - Relies on untyped API values for attendance, complaints, and leave data.

## Notable positives
- The shared API layer in [frontend/src/services/api.ts](frontend/src/services/api.ts) is relatively well-typed.
- The backend uses zod-derived request/response types in several modules, which is a good pattern.
- The core domain entities in [backend/src/types/index.ts](backend/src/types/index.ts) provide a centralized type foundation for auth and request handling.

## Recommended next steps
1. Replace any usage of any with explicit domain types or Prisma-generated types.
2. Consolidate duplicate auth and UI prop interfaces into shared modules.
3. Replace repeated casts with properly typed helpers or typed arrays.
4. Introduce stronger request/response models for the student, parent, and admin UI data flows.
