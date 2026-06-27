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
let server: http.Server;

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
    process.exit(1);
  }

  // 2. Create Express app
  const app = createApp();

  // 3. Create HTTP server
  server = http.createServer(app);

  // 4. Configure keep-alive timeouts (important for production behind a proxy)
  server.keepAliveTimeout = 65_000; // slightly > nginx's default 60s
  server.headersTimeout = 66_000;

  // 5. Start listening
  await new Promise<void>((resolve) => {
    server.listen(env.PORT, () => {
      logger.info(`[Server] ✅ Listening on http://localhost:${env.PORT}`);
      logger.info(`[Server] 📡 API base: http://localhost:${env.PORT}${env.apiPrefix}`);
      logger.info(`[Server] 🏥 Health:   http://localhost:${env.PORT}${env.apiPrefix}/health`);
      resolve();
    });
  });
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
