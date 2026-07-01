# Authentication Audit

## Scope
This audit reviews the authentication implementation across the backend auth module, JWT helpers, middleware, and the frontend auth integration layer. It covers login, register, logout, JWT handling, refresh-token flow, route protection, and role-based protection.

## Login
### Backend
- The login endpoint is implemented in [backend/src/modules/auth/auth.controller.ts](backend/src/modules/auth/auth.controller.ts) and mounted at /api/v1/auth/login in [backend/src/routes/v1.router.ts](backend/src/routes/v1.router.ts).
- The request body is validated by [backend/src/modules/auth/auth.validation.ts](backend/src/modules/auth/auth.validation.ts).
- The service in [backend/src/modules/auth/auth.service.ts](backend/src/modules/auth/auth.service.ts) checks the user by email, verifies the password with bcrypt, disables inactive accounts, and issues a new session.

### Notes
- Login returns an access token and a refresh token.
- The refresh token is also stored in the database via the refresh-token table, which supports revocation and rotation.

## Register
### Backend
- The register endpoint is implemented in [backend/src/modules/auth/auth.controller.ts](backend/src/modules/auth/auth.controller.ts) and mounted at /api/v1/auth/register.
- The input is validated in [backend/src/modules/auth/auth.validation.ts](backend/src/modules/auth/auth.validation.ts).
- The service checks whether the email already exists, hashes the password with bcrypt, creates the user, and creates a session.

### Notes
- Newly created users are assigned the STUDENT role by default in [backend/src/modules/auth/auth.service.ts](backend/src/modules/auth/auth.service.ts).
- This is a simple default and may be insufficient if admin or other roles need to be created through the public register flow.

## Logout
### Backend
- Logout is implemented in [backend/src/modules/auth/auth.controller.ts](backend/src/modules/auth/auth.controller.ts).
- It reads the refresh token from the cookie, revokes it in the database, and clears the cookie.

### Notes
- The logout flow depends on the refresh token being present in the cookie, which is consistent with the current implementation.

## JWT
### Backend
- Access and refresh tokens are created by [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts).
- Access tokens are signed with a short expiration and include the subject, role, and optional hostelId.
- Refresh tokens include a UUID-based JTI for revocation tracking.

### Verification and middleware
- Access tokens are verified in [backend/src/middleware/authenticate.middleware.ts](backend/src/middleware/authenticate.middleware.ts).
- The middleware attaches user identity to req.user for downstream handlers.

### Observations
- The access-token verification path is present and clear.
- The JWT implementation is structured well for a standard auth flow.

## Refresh token
### Backend
- The refresh route is implemented in [backend/src/modules/auth/auth.controller.ts](backend/src/modules/auth/auth.controller.ts).
- The service in [backend/src/modules/auth/auth.service.ts](backend/src/modules/auth/auth.service.ts) validates the refresh token, checks that the corresponding DB record exists and is still active, rotates the token, and issues a new refresh token + access token.
- The refresh token is stored and revoked by JTI in the database.

### Notes
- The refresh flow is stronger than a simple stateless approach because it supports revocation and rotation.
- The implementation depends on the refresh token being stored in an httpOnly cookie.

## Route protection
### Backend
- Protected routes are enforced by [backend/src/middleware/authenticate.middleware.ts](backend/src/middleware/authenticate.middleware.ts).
- The auth routes themselves are wired in [backend/src/modules/auth/auth.routes.ts](backend/src/modules/auth/auth.routes.ts), where /me is protected and the public endpoints are register/login/logout/refresh.

### Notes
- Route protection is currently applied consistently in the modules that are mounted, for example:
  - [backend/src/modules/leave/leave.routes.ts](backend/src/modules/leave/leave.routes.ts)
  - [backend/src/modules/complaints/complaint.routes.ts](backend/src/modules/complaints/complaint.routes.ts)
  - [backend/src/modules/laundry/laundry.routes.ts](backend/src/modules/laundry/laundry.routes.ts)
  - [backend/src/modules/visitors/visitor.routes.ts](backend/src/modules/visitors/visitor.routes.ts)
  - [backend/src/modules/fees/fees.routes.ts](backend/src/modules/fees/fees.routes.ts)

## Role protection
### Backend
- Role-based protection is implemented in [backend/src/middleware/rbac.middleware.ts](backend/src/middleware/rbac.middleware.ts).
- The middleware exposes requireRoles, requirePermission, requireSelfOrRoles, requireSuperAdmin, requireAdmin, and requireWarden.
- The route modules use requirePermission for access control on feature actions.

### Notes
- The RBAC layer is well defined and covers many resource-action combinations.
- The main gap is that the student routes are not mounted in the main router, so their protected endpoints are not currently exposed even though the middleware exists.

## Frontend auth integration
### Notes
- The frontend auth-integration layer uses the auth endpoints in [frontend/src/auth-integration/src/api/endpoints.ts](frontend/src/auth-integration/src/api/endpoints.ts).
- The client wrapper in [frontend/src/auth-integration/src/api/authService.ts](frontend/src/auth-integration/src/api/authService.ts) calls login, register, refresh, logout, and me.
- The axios client in [frontend/src/auth-integration/src/api/axiosInstance.ts](frontend/src/auth-integration/src/api/axiosInstance.ts) attaches the access token and handles refresh-token retry logic.

## Overall assessment
The authentication implementation is structurally solid. The core login/register/logout/refresh/JWT flow is present and reasonably consistent, and route protection plus role-based permissions are implemented in a centralized way. The main concerns are operational rather than architectural:
- the public register flow defaults all users to STUDENT,
- the frontend auth endpoints are in an integration folder rather than the primary app service layer,
- and student-protected routes are not exposed because the student router is not mounted in the main API router.
