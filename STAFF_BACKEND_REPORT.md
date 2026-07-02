# Staff Backend Report

## Scope
Implemented backend support for creating and managing staff accounts for the following roles only:
- ADMIN
- WARDEN
- TRUSTEE
- ACCOUNTANT
- LAUNDRY_STAFF

The implementation is limited to staff account administration and does not alter student or parent authentication flows.

## What Changed

### 1) Prisma schema extensions
The existing Prisma schema was extended to support staff-account activation data on the shared User model without introducing a separate auth system:
- `fullName`
- `accountStatus`
- `activationToken`
- `activationOtpHash`
- `otpExpiry`
- `createdById`

A new Prisma enum `StaffAccountStatus` was added with:
- `PENDING_ACTIVATION`
- `ACTIVE`
- `SUSPENDED`

### 2) New admin staff module
A new backend module was added under `backend/src/modules/admin/` with:
- `admin.routes.ts`
- `admin.controller.ts`
- `admin.service.ts`
- `admin.validation.ts`

### 3) New routes
The following endpoints are available:
- `POST /api/v1/admin/staff`
- `GET /api/v1/admin/staff`
- `GET /api/v1/admin/staff/:id`
- `PUT /api/v1/admin/staff/:id`
- `PATCH /api/v1/admin/staff/:id/status`

### 4) Access control
All staff-management routes require:
- authentication via existing JWT middleware
- `SUPER_ADMIN` role via the existing RBAC middleware

## Behavior

### Staff account creation
When a `SUPER_ADMIN` creates a staff account:
- a new `User` record is created with the requested role
- a corresponding `Staff` record is created
- the account is initialized as `PENDING_ACTIVATION`
- the account is not activated permanently
- an activation token is generated
- an activation OTP is generated
- the OTP is hashed before storage
- OTP expiry is set to 15 minutes from creation
- no permanent password is created

### Stored fields
Each created staff account stores:
- UUID (user ID)
- full name
- email
- mobile number
- role
- hostel assignment
- status = `PENDING_ACTIVATION`
- createdBy
- createdAt
- updatedAt

## Validation
Request validation was added for:
- staff creation
- staff update
- staff status update

## Verification
Verified by running:
- `npm run typecheck`

Result: backend TypeScript compilation completed successfully.
