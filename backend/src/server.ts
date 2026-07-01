/**
 * HostelPaglu Backend — Server Entry Point
 *
 * Responsibilities:
 *  1. Load and validate environment variables (via createApp → env import)
 *  2. Connect to the database
 *  3. Boot the HTTP server
 *  4. Register process signal handlers for graceful shutdown
 */

import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { prisma, disconnectPrisma } from './config/database';
import { logger } from './utils/logger';

// ─── Shutdown State ───────────────────────────────────────────────────────────
let isShuttingDown = false;
let server: http.Server | undefined;

async function listenWithFallback(app: ReturnType<typeof createApp>, basePort: number): Promise<[http.Server, number]> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidatePort = basePort + attempt;
    const candidateServer = http.createServer(app);
    candidateServer.keepAliveTimeout = 65_000;
    candidateServer.headersTimeout = 66_000;

    try {
      await new Promise<void>((resolve, reject) => {
        const onError = (err: NodeJS.ErrnoException) => {
          candidateServer.off('error', onError);
          reject(err);
        };

        candidateServer.once('error', onError);
        candidateServer.listen(candidatePort, () => {
          candidateServer.off('error', onError);
          resolve();
        });
      });

      return [candidateServer, candidatePort];
    } catch (err) {
      candidateServer.close(() => undefined);
      if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Unable to start server after multiple attempts on port ${basePort}`);
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  logger.info(`[Server] Starting ${env.APP_NAME} in ${env.NODE_ENV} mode…`);

  // 1. Verify database connectivity
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('[Server] ✅ Database connected');
  } catch (err) {
    logger.error('[Server] ❌ Database connection failed', { error: err });
    if (env.isProduction) {
      // In production, fail fast
      process.exit(1);
    }
    // In development, allow the server to start so non-DB routes and static checks can run.
    logger.warn('[Server] Continuing startup in development mode without database connection');
  }

  // 2. Create Express app
  const app = createApp();

  // 3. Start listening with a port fallback when the preferred port is busy
  const [listeningServer, listeningPort] = await listenWithFallback(app, env.PORT);
  server = listeningServer;

  logger.info(`[Server] ✅ Listening on http://localhost:${listeningPort}`);
  logger.info(`[Server] 📡 API base: http://localhost:${listeningPort}${env.apiPrefix}`);
  logger.info(`[Server] 🏥 Health:   http://localhost:${listeningPort}${env.apiPrefix}/health`);
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn(`[Server] Shutdown already in progress (received ${signal})`);
    return;
  }

  isShuttingDown = true;
  logger.info(`[Server] 🛑 ${signal} received — shutting down gracefully…`);

  // 1. Stop accepting new connections
  if (!server) {
    logger.warn('[Server] No active server to close');
    process.exit(0);
    return;
  }

  server.close(async (err) => {
    if (err) {
      logger.error('[Server] Error closing HTTP server', { error: err });
    } else {
      logger.info('[Server] HTTP server closed');
    }

    // 2. Disconnect from the database
    try {
      await disconnectPrisma();
      logger.info('[Server] Database disconnected');
    } catch (dbErr) {
      logger.error('[Server] Error disconnecting from database', { error: dbErr });
    }

    logger.info('[Server] 👋 Shutdown complete');
    process.exit(err ? 1 : 0);
  });

  // Force-exit if graceful shutdown takes too long (30s)
  setTimeout(() => {
    logger.error('[Server] ⏰ Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 30_000).unref();
}

// ─── Process Signal Handlers ──────────────────────────────────────────────────
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM')); // Docker / K8s stop
process.on('SIGINT',  () => void gracefulShutdown('SIGINT'));  // Ctrl+C

// Unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('[Process] Unhandled promise rejection', { reason });
  // In production, let the process manager restart us
  if (env.isProduction) process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('[Process] Uncaught exception', { error: err.message, stack: err.stack });
  // Always exit on uncaught exception — state is unrecoverable
  process.exit(1);
});

// ─── Start ────────────────────────────────────────────────────────────────────
bootstrap().catch((err: unknown) => {
  logger.error('[Server] Fatal error during bootstrap', { error: err });
  process.exit(1);
});
