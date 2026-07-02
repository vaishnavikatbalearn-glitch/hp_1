# BACKEND_RUNTIME_REPORT

## Summary
This report verifies backend startup/runtime behavior for the `backend` service and documents the current state of Prisma initialization, database connectivity, middleware setup, route registration, authentication middleware, and error handling.

## Prisma Initialization
- Prisma is initialized lazily in `backend/src/config/database.ts` via `createPrismaClient()`.
- `@prisma/client` is loaded dynamically at runtime to avoid import-time failures.
- A global Prisma client is registered in development mode for HMR/ts-node-dev reuse.
- Initialization failures are captured and converted into helpful runtime errors.

## Database Connection
- Startup performs a database connection check in `backend/src/server.ts`:
  - `await prisma.$connect()`
  - `await prisma.$queryRaw`SELECT 1``
- On failure, the server logs a Prisma connection error and, in development, continues startup.
- Terminal logs confirm a runtime failure with `PrismaClientInitializationError` and error code `P1001`.
- The reported issue is a database connection failure, not a code syntax error.
- Root cause is likely one of:
  - invalid or missing `DATABASE_URL`
  - database service not running/reachable
  - network/connectivity issue to the PostgreSQL instance

## Environment Configuration
- Environment parsing is handled in `backend/src/config/env.ts` with `zod` validation.
- `DATABASE_URL` is required and defaults to a local fallback value if not set.
- If environment validation fails, the process exits early.
- In the current runtime scenario, the project starts but the DB connection fails; this suggests `DATABASE_URL` is present but the DB is unreachable.

## Middleware Setup
- `backend/src/app.ts` configures expected Express middleware in the correct order:
  - `helmet` for security headers
  - `cors` with origin allowlist and development bypass
  - `compression` for response compression
  - request ID middleware
  - `morgan` HTTP request logging
  - JSON and URL-encoded body parsing
  - `cookie-parser`
  - global rate limiter
- Static upload serving is enabled at `/uploads`.
- The middleware stack appears correct for startup/runtime behavior.

## Route Registration
- `backend/src/routes/v1.router.ts` registers the API versioned routes under `/api/v1`.
- Registered module routes include:
  - `/auth`
  - `/leave`
  - `/complaints`
  - `/visitors`
  - `/visitor`
  - `/laundry`
  - `/attendance`
  - `/fees`
  - `/notifications`
  - `/student`
  - `/rooms`
- Health check route `/api/v1/health` is present and returns service health metadata.
- Route registration is valid and does not exhibit startup errors.

## Authentication Middleware
- `backend/src/middleware/authenticate.middleware.ts` contains:
  - `authenticate` middleware to enforce JWT authorization
  - `optionalAuthenticate` middleware for optional token parsing
- Tokens are extracted from the `Authorization` header and verified via `verifyAccessToken`.
- Decoded payload is attached to `req.user` for downstream route handlers.
- Middleware is implemented correctly for runtime authentication flows.

## Error Middleware
- `backend/src/middleware/error.middleware.ts` includes:
  - `notFoundHandler` for unmatched routes
  - `errorHandler` as the global Express error handler
- Error handling covers:
  - `AppError` classification
  - Zod validation errors
  - Prisma errors, including `P1001` database unreachable
  - JWT token errors
  - malformed JSON errors
  - generic internal server errors
- Response formatting includes status, error code, message, requestId, and stack trace in development.

## Runtime Issues Identified
- Primary runtime issue: Prisma cannot connect to the database (`P1001`) during startup.
- The backend currently continues to start in development mode after the DB failure.
- No other startup/runtime issues were detected in the inspected backend files.

## Recommended Fix
- Ensure the PostgreSQL database is running and accessible from the backend environment.
- Verify that `DATABASE_URL` is correct and matches the target database.
- If a local database is expected, start the database service before backend startup.
- If startup should fail on DB connection issues in development, change the catch behavior in `backend/src/server.ts`.

## Conclusion
The backend startup flow and middleware registration are configured correctly. The only verified runtime fault is database connectivity; resolving the database availability or connection string will restore normal backend operation.
