import { existsSync } from 'fs';
import path from 'path';
import { z } from 'zod';
import dotenv from 'dotenv';

const fallbackDatabaseUrl = 'postgresql://postgres:postgres@127.0.0.1:5432/hostelpaglu?schema=public';
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(__dirname, '..', '.env'),
].filter((candidate, index, list) => list.indexOf(candidate) === index);

const resolvedEnvPath = envCandidates.find((candidate) => existsSync(candidate));

// Load .env before anything else
if (resolvedEnvPath) {
  dotenv.config({ path: resolvedEnvPath });
} else {
  dotenv.config();
}

// ─── Environment Schema ───────────────────────────────────────────────────────
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('HostelPaglu'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Database
  DATABASE_URL: z.string().trim().min(1, 'DATABASE_URL is required').default(fallbackDatabaseUrl),
  DATABASE_POOL_MIN: z.coerce.number().int().nonnegative().default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('debug'),
  LOG_DIR: z.string().default('logs'),
  LOG_MAX_FILES: z.string().default('30d'),
  LOG_MAX_SIZE: z.string().default('20m'),

  // File Upload
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10),
  ALLOWED_FILE_TYPES: z
    .string()
    .default('image/jpeg,image/png,image/webp,application/pdf'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  // Bcrypt
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
});

// ─── Parse & Validate ─────────────────────────────────────────────────────────
const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('❌ Invalid environment variables:\n');
  const issues = _parsed.error.flatten().fieldErrors;
  Object.entries(issues).forEach(([key, errors]) => {
    if (errors) console.error(`  ${key}: ${errors.join(', ')}`);
  });
  process.exit(1);
}

// ─── Typed Environment ───────────────────────────────────────────────────────
export const env = Object.freeze({
  ..._parsed.data,

  // Derived helpers
  isDevelopment: _parsed.data.NODE_ENV === 'development',
  isProduction: _parsed.data.NODE_ENV === 'production',
  isTest: _parsed.data.NODE_ENV === 'test',

  corsOrigins: _parsed.data.CORS_ORIGINS.split(',').map((o) => o.trim()),
  allowedFileTypes: _parsed.data.ALLOWED_FILE_TYPES.split(',').map((t) => t.trim()),
  maxFileSizeBytes: _parsed.data.MAX_FILE_SIZE_MB * 1024 * 1024,
  apiPrefix: `/api/${_parsed.data.API_VERSION}`,
});

export type Env = typeof env;
