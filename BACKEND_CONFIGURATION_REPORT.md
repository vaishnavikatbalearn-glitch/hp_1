**Backend Configuration Report — HostelPaglu**

Summary
- Review date: 2026-06-30
- Scope: Verify DATABASE_URL usage, Prisma schema, client generation, migrations, seed, backend startup, and identify exact blockers preventing startup.

**1. DATABASE_URL usage**:
- Location: [backend/.env](backend/.env)
- Value present: DATABASE_URL="postgresql://postgres:PP7LIyXNHeUR1pSf@db.wzkocjnyukvfhwobsylt.supabase.co:5432/postgres"
- Validation: `backend/src/config/env.ts` requires `DATABASE_URL` (zod: min(1)) and will exit if missing/invalid. The app reads `.env` at process start via dotenv.
- Conclusion: `DATABASE_URL` is configured and required by the app; if unreachable the code handles it (see server behavior below).

**2. Prisma schema**:
- Location: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- Provider: `postgresql` and `url = env("DATABASE_URL")` — schema expects Postgres.
- Observations: Schema is comprehensive and consistent with models used by the codebase (users, students, leaves, complaints, notifications, audit logs, etc.). Generator uses `provider = "prisma-client-js"`.
- Conclusion: Schema is valid (no syntax errors observed in file); it targets PostgreSQL via `DATABASE_URL`.

**3. Prisma client generation**:
- Script: `backend/package.json` defines `prisma:generate` -> `prisma generate`.
- Generated client location: `backend/node_modules/.prisma/client` exists.
- Evidence of failed/partial generation: In `backend/node_modules/.prisma/client` there is both `query_engine-windows.dll.node` and a temp file `query_engine-windows.dll.node.tmp17200` (temporary file leftover from generation). This pattern indicates the generator attempted to write and rename the binary but rename was interrupted or failed (commonly seen on Windows when the folder is managed by OneDrive or an anti-virus / file-lock prevents atomic rename).
  - Path inspected: `backend/node_modules/.prisma/client/query_engine-windows.dll.node.tmp17200` and `.../query_engine-windows.dll.node` present.
- Prior runtime attempt: logs and terminal history show `prisma:generate` previously failed with an EPERM rename error while writing the query engine binary. That partial state prevents a healthy runtime Prisma client.
- Conclusion: Prisma client generation is incomplete/corrupted due to a file rename/permission issue during generation (likely caused by OneDrive or file-locking on Windows). This prevents Prisma from reliably loading the query engine at runtime.

**4. Migrations folder**:
- Location inspected: `backend/prisma` contains `schema.prisma` and `seed.ts` only.
- There is no `backend/prisma/migrations` folder in the repo.
- Conclusion: Migration history is not present in the repo. This means `prisma migrate dev` cannot apply an existing migration history here — running it will create new migrations (which may be desired), but there is no committed migration baseline to reproduce the production DB state.

**5. Seed file**:
- Location: `backend/prisma/seed.ts` (exists).
- Contents: Seed creates Super Admin, sample hostel, Admin/Warden users, floor/room seed data. It uses `PrismaClient` and `bcryptjs` and expects DB connectivity.
- Script hook: `prisma:seed` runs `ts-node prisma/seed.ts` per `package.json`.
- Conclusion: Seed file is present and runnable once Prisma client generation and DB connectivity are fixed.

**6. Backend startup behavior**:
- Entry point: `backend/src/server.ts`.
- Behavior: On bootstrap the code attempts `await prisma.$connect()` and `await prisma.$queryRaw`.
  - If DB connect fails:
    - In `production` the process exits (fail-fast).
    - In `development` the server logs a warning and continues startup so non-DB routes can run.
- Environment validation: `env.ts` validates required vars (including `DATABASE_URL`) and exits if missing/invalid.
- Prisma client instantiation: `backend/src/config/database.ts` instantiates `new PrismaClient()` at module import time and exports `prisma` as a singleton. This means Prisma client creation occurs during module import, before explicit `$connect()` in `server.ts`.
- Conclusion: The app will start in development even if the DB is unreachable; however, PrismaClient construction happens at import and can fail if the generated query engine is missing or corrupted.

**7. Exact blockers preventing backend startup**
(ordered by likelihood / impact)

- A. Incomplete / corrupted Prisma query engine (primary blocker)
  - Evidence: `backend/node_modules/.prisma/client/query_engine-windows.dll.node.tmp17200` exists alongside `query_engine-windows.dll.node`. The temporary file indicates `prisma generate` attempted to write/rename the query engine but was interrupted or denied permission.
  - Symptom: When Node imports `@prisma/client` / constructs `PrismaClient`, the client attempts to load the query engine binary/wasm. If the binary is missing, corrupted, or the rename left a partial state, Prisma will throw at runtime (or fail to operate reliably). Terminal history shows `prisma:generate` previously failed with EPERM when renaming that binary on Windows (OneDrive-related file locking is a common cause).
  - Impact: Prevents Prisma client from functioning; may throw errors during module import or when attempting to connect, preventing DB-backed features from working and may crash processes in production.

- B. OneDrive file-locks / Windows EPERM during `prisma generate` (contributing root cause)
  - Evidence: Repo is located under OneDrive path (c:\Users\katba\OneDrive\Documents\OneDrive\Desktop\hp_1). OneDrive is known to interfere with atomic file operations used by Prisma when writing native binaries.
  - Symptom: `EPERM` or rename errors during `prisma generate` as observed.
  - Impact: Causes incomplete generation as above.

- C. Remote DB connectivity (secondary / expected run-time blocker)
  - Evidence: `DATABASE_URL` points to a Supabase-hosted Postgres instance. Previous runtime attempts showed Prisma error P1001 (database unreachable) in logs/context; network/firewall/credentials or Supabase settings could cause this.
  - Symptom: If DB unreachable, `prisma.$connect()` fails; server will continue in development but DB-backed features will not work. In production the process will exit.
  - Impact: Blocks end-to-end testing and seed/migration application until reachable.

- D. Missing migrations folder (operational note)
  - Evidence: `backend/prisma/migrations` does not exist in repo. This is not a crash blocker by itself, but limits reproducible schema migration application and may cause `prisma migrate dev` to create new migrations unexpectedly.

**Repro steps to confirm & fix (safe, non-destructive checklist)**
1. Outside OneDrive (recommended), or after temporarily disabling OneDrive syncing for this folder, run:

```bash
cd backend
npm run prisma:generate
```

2. Verify `backend/node_modules/.prisma/client/` contains no `.tmp` files and that `query_engine-windows.dll.node` is intact.
3. If you prefer a local dev DB, set `DATABASE_URL="file:./dev.db"` (SQLite) temporarily in `backend/.env`, then run `npm run prisma:migrate` and `npm run prisma:seed` to bootstrap a local DB for testing.
4. If using the provided Supabase URL, ensure network can reach it and credentials are valid; then run `npm run prisma:generate` and `npm run prisma:migrate` and `npm run prisma:seed`.

**Appendix — Relevant file pointers**
- `backend/.env` — configured DATABASE_URL and `PORT=5001`.
- `backend/prisma/schema.prisma` — PostgreSQL schema.
- `backend/prisma/seed.ts` — seed script.
- `backend/package.json` — prisma scripts (`prisma:generate`, `prisma:migrate`, `prisma:seed`).
- `backend/src/config/database.ts` — PrismaClient instantiation (runs at import time).
- `backend/src/server.ts` — attempts DB connect; continues in development if DB unreachable.
- `backend/node_modules/.prisma/client/` — contains query engine and a `.tmp` file (evidence of failed generate).

-- End of report
