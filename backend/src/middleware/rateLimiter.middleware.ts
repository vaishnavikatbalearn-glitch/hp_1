import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../types/errors';

// ─── Rate Limit Handler ───────────────────────────────────────────────────────
const rateLimitExceededHandler = (): never => {
  throw AppError.tooManyRequests('Too many requests, please try again later.');
};

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
/**
 * Applied to ALL routes.
 * Window: 15 minutes / 100 requests per IP (configurable via env).
 */
export const globalRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,   // Return `RateLimit-*` headers
  legacyHeaders: false,    // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  handler: rateLimitExceededHandler,
  skip: (req) => {
    // Skip rate limiting in test environment
    return env.isTest || req.ip === '127.0.0.1';
  },
});

// ─── Auth Rate Limiter ────────────────────────────────────────────────────────
/**
 * Stricter limiter for authentication endpoints to prevent brute-force.
 * Window: 15 minutes / 10 attempts per IP.
 */
export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: rateLimitExceededHandler,
  skip: () => env.isTest,
  keyGenerator: (req) => {
    // Key by IP + email combo to prevent distributed attacks
    const email = (req.body as { email?: string }).email ?? '';
    return `${req.ip}-${email}`;
  },
});

// ─── Upload Rate Limiter ──────────────────────────────────────────────────────
/**
 * Applied to file upload endpoints.
 * Window: 1 hour / 30 uploads per user.
 */
export const uploadRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  skip: () => env.isTest,
});
