import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('Prisma');

// ─── Prisma Singleton ─────────────────────────────────────────────────────────
// Prevent multiple PrismaClient instances in development due to HMR / hot reload.
// In production there is always exactly one instance.

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: env.isDevelopment
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
    errorFormat: env.isDevelopment ? 'pretty' : 'minimal',
  });
}

export const prisma: PrismaClient =
  env.isProduction
    ? createPrismaClient()
    : (global.__prisma ?? (global.__prisma = createPrismaClient()));

// ─── Query Logging (dev only) ─────────────────────────────────────────────────
if (env.isDevelopment) {
  (prisma as PrismaClient).$on('query' as never, (e: { query: string; duration: number }) => {
    if (process.env.LOG_QUERIES === 'true') {
      log.http(`${e.query} (${e.duration}ms)`);
    }
  });
}

// ─── Graceful Disconnect ──────────────────────────────────────────────────────
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
