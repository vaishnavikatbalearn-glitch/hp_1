# HostelPaglu Backend

Production-ready REST API for the HostelPaglu Hostel Management System.

Built with **Node.js · TypeScript · Express · Prisma · PostgreSQL**

---

## Quick Start

### Prerequisites
- Node.js ≥ 20
- PostgreSQL ≥ 14
- npm ≥ 10

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in your values
```

### 3. Set up the database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with initial data
npm run prisma:seed
```

### 4. Start development server
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api/v1`

---

## Folder Structure

```
src/
├── config/
│   ├── env.ts              # Zod-validated environment variables
│   └── database.ts         # Prisma singleton
├── middleware/
│   ├── authenticate.middleware.ts   # JWT auth
│   ├── rbac.middleware.ts           # Role-based access control
│   ├── validate.middleware.ts       # Zod request validation
│   ├── rateLimiter.middleware.ts    # express-rate-limit
│   ├── requestId.middleware.ts      # X-Request-Id header
│   └── error.middleware.ts          # Global error handler + 404
├── modules/
│   └── (feature modules go here — auth, student, room, etc.)
├── routes/
│   └── v1.router.ts        # API v1 route aggregator
├── services/
│   └── (shared services — email, storage, etc.)
├── types/
│   ├── index.ts            # Shared TypeScript types
│   └── errors.ts           # AppError class + ErrorCode enum
└── utils/
    ├── asyncHandler.ts     # Async error wrapper
    ├── jwt.ts              # Token sign / verify helpers
    ├── logger.ts           # Winston logger + child factory
    └── response.ts         # ApiResponse + pagination helpers

prisma/
├── schema.prisma           # Full data model (27 models)
└── seed.ts                 # Seed script
```

---

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API info |
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/auth/login` | Login (to be implemented) |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |

> Module routes are commented out in `src/routes/v1.router.ts` and ready to be enabled.

---

## Role-Based Access Control

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full system access |
| `ADMIN` | Hostel-level management |
| `WARDEN` | Day-to-day supervision |
| `STUDENT` | Own profile + requests |
| `PARENT` | Read-only child data |
| `TRUSTEE` | Reports and analytics |
| `ACCOUNTANT` | Financial management |
| `LAUNDRY_STAFF` | Laundry requests |

Use the middleware in routes:
```ts
import { authenticate } from '@middleware/authenticate.middleware';
import { requirePermission, requireRoles } from '@middleware/rbac.middleware';

router.get('/students',
  authenticate,
  requirePermission('student:read'),
  handler
);
```

---

## Adding a New Module

1. Create `src/modules/<name>/` with:
   - `<name>.routes.ts`
   - `<name>.controller.ts`
   - `<name>.service.ts`
   - `<name>.schema.ts`   (Zod schemas)
2. Mount in `src/routes/v1.router.ts`

---

## Scripts

```bash
npm run dev          # Development server with hot reload
npm run build        # Compile TypeScript
npm run start        # Production server
npm run lint         # ESLint
npm run typecheck    # TypeScript type check only
npm run prisma:studio  # Prisma Studio GUI
npm run prisma:seed    # Seed database
```

---

## Environment Variables

See `.env.example` for the full list with descriptions.

---

## Default Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@hostelpaglu.com | SuperAdmin@123 |
| Admin | admin@hostelpaglu.com | Admin@123 |
| Warden | warden@hostelpaglu.com | Warden@123 |

> Change all passwords immediately in production.
