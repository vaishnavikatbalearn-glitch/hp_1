import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';

import { env } from './config/env';
import { logger, httpLogStream } from './utils/logger';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import v1Router from './routes/v1.router';

// ─── App Factory ──────────────────────────────────────────────────────────────
export function createApp(): Application {
  const app = express();

  // ── Trust Proxy (required if behind Nginx/load balancer) ──────────────────
  if (env.isProduction) {
    app.set('trust proxy', 1);
  }

  // ── Security Headers ────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction,
      crossOriginEmbedderPolicy: env.isProduction,
    }),
  );

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl)
        if (!origin) return callback(null, true);
        if (env.corsOrigins.includes(origin) || env.isDevelopment) {
          return callback(null, true);
        }
        callback(new Error(`CORS: origin "${origin}" is not allowed`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-Id',
        'X-Api-Key',
      ],
      exposedHeaders: ['X-Request-Id', 'X-Total-Count'],
      maxAge: 86400, // 24 hours preflight cache
    }),
  );

  // ── Compression ─────────────────────────────────────────────────────────────
  app.use(compression());

  // ── Request ID (must be before logging) ────────────────────────────────────
  app.use(requestIdMiddleware);

  // ── HTTP Request Logging ────────────────────────────────────────────────────
  if (!env.isTest) {
    const morganFormat = env.isDevelopment
      ? ':method :url :status :response-time ms — :res[content-length] bytes [:req[x-request-id]]'
      : 'combined';
    app.use(morgan(morganFormat, { stream: httpLogStream }));
  }

  // ── Body Parsers ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Cookie Parser (for refresh tokens)
  app.use(cookieParser());

  // ── Global Rate Limiter ─────────────────────────────────────────────────────
  app.use(globalRateLimiter);

  // ── Root ────────────────────────────────────────────────────────────────────
  app.get('/', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
      name: env.APP_NAME,
      description: 'Smart Hostel Management System API',
      version: env.API_VERSION,
      documentation: `/api/${env.API_VERSION}/docs`,
      health: `/api/${env.API_VERSION}/health`,
    });
  });

  // ── API Routes ───────────────────────────────────────────────────────────────
  app.use(`/api/${env.API_VERSION}`, v1Router);

  // ── Static Files (uploads) ──────────────────────────────────────────────────
  app.use('/uploads', express.static('uploads'));

  // ── 404 ──────────────────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ── Global Error Handler (MUST be last, has 4 params) ────────────────────────
  app.use(errorHandler);

  logger.info(`[App] Express app initialised (${env.NODE_ENV})`);

  return app;
}
