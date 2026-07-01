import type { PrismaClient } from '@prisma/client';
import { env } from './env';
import { createModuleLogger } from '../utils/logger';

const log = createModuleLogger('Prisma');

// Lazily load and initialize Prisma at first use to avoid import-time failures
// (e.g. on Windows when `prisma generate` left partial binaries or OneDrive
// interferes with atomic file operations). We export a proxy that will attempt
// to initialize the real client on first property access. If initialization
// fails, the proxy returns functions that throw a clear error when invoked.

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let realPrisma: PrismaClient | undefined;
let initError: unknown = null;

function createPrismaClient(): PrismaClient {
  // Dynamic require to avoid loading @prisma/client at module-import time.
  // This prevents Node from attempting to load the native query engine before
  // we have a chance to handle errors gracefully.
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const { PrismaClient: _PrismaClient } = require('@prisma/client');

  const client: PrismaClient = new _PrismaClient({
    log: env.isDevelopment
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
    errorFormat: env.isDevelopment ? 'pretty' : 'minimal',
  });

  // Attach dev global for HMR / ts-node-dev scenarios
  if (!env.isProduction) global.__prisma = global.__prisma ?? client;

  return client;
}

function ensurePrismaInitialized(): PrismaClient | null {
  if (realPrisma) return realPrisma;
  try {
    realPrisma = (global.__prisma ?? createPrismaClient()) as PrismaClient;

    // Query logging in dev (attach after successful init)
    if (env.isDevelopment) {
      try {
        (realPrisma as unknown as { $on: Function }).$on('query', (e: { query: string; duration: number }) => {
          if (process.env.LOG_QUERIES === 'true') {
            log.http(`${e.query} (${e.duration}ms)`);
          }
        });
      } catch (e) {
        // Non-fatal: continue even if $on is not available
      }
    }

    return realPrisma;
  } catch (err) {
    initError = err;
    log.error('Prisma client initialization failed', { error: err });
    return null;
  }
}

// A forgiving proxy that defers initialization until a property is accessed.
// If initialization failed, calling any method will throw a helpful error.
export const prisma = new Proxy({} as Record<string, unknown>, {
  get(_target, prop: string) {
    const client = ensurePrismaInitialized();
    if (client) {
      // @ts-ignore - forward property
      return (client as any)[prop];
    }

    // Return a function that throws when invoked so callers get a clear runtime error
    return (..._args: unknown[]) => {
      throw new Error(`Prisma client unavailable: ${String(initError ?? 'initialization failed')}`);
    };
  },
  // Support calling the proxy as a function if needed (rare for Prisma)
  apply(_target, _thisArg, _args) {
    const client = ensurePrismaInitialized();
    if (!client) throw new Error(`Prisma client unavailable: ${String(initError ?? 'initialization failed')}`);
    // @ts-ignore
    return (client as any).apply(_thisArg, _args);
  },
}) as unknown as PrismaClient;

export async function disconnectPrisma(): Promise<void> {
  const client = ensurePrismaInitialized();
  if (client) await client.$disconnect();
}
