import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError, z } from 'zod';
import { AppError } from '../types/errors';
import type { ValidationErrorDetail } from '../types/errors';

// ─── Validation Target ────────────────────────────────────────────────────────
type ValidationTarget = 'body' | 'query' | 'params';

// ─── Zod Validation Middleware ────────────────────────────────────────────────
/**
 * Validates `req[target]` against a Zod schema.
 * On success, replaces `req[target]` with the parsed (coerced + stripped) data.
 * On failure, passes a structured 422 AppError to next().
 *
 * @example
 * router.post('/login', validate(loginSchema, 'body'), loginHandler);
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (result.success) {
      // Replace with coerced/stripped data
      (req as unknown as Record<string, unknown>)[target] = result.data;
      return next();
    }

    const details: ValidationErrorDetail[] = formatZodErrors(result.error);
    return next(
      AppError.validation(
        `Validation failed on request ${target}`,
        details,
      ),
    );
  };
}

/**
 * Validates multiple targets in one middleware.
 *
 * @example
 * router.get('/rooms/:id', validateAll({ params: roomIdSchema, query: paginationSchema }), handler);
 */
export function validateAll(schemas: Partial<Record<ValidationTarget, ZodSchema>>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const allDetails: ValidationErrorDetail[] = [];

    for (const [target, schema] of Object.entries(schemas) as [ValidationTarget, ZodSchema][]) {
      if (!schema) continue;
      const result = schema.safeParse(req[target]);
      if (result.success) {
        (req as unknown as Record<string, unknown>)[target] = result.data;
      } else {
        allDetails.push(...formatZodErrors(result.error, target));
      }
    }

    if (allDetails.length > 0) {
      return next(AppError.validation('Validation failed', allDetails));
    }

    next();
  };
}

// ─── Zod Error Formatter ──────────────────────────────────────────────────────
function formatZodErrors(error: ZodError, prefix?: string): ValidationErrorDetail[] {
  return error.errors.map((issue) => ({
    field: prefix
      ? `${prefix}.${issue.path.join('.')}`
      : issue.path.join('.') || 'root',
    message: issue.message,
    value: undefined, // avoid leaking input values in production
  }));
}

// ─── Common Reusable Schemas ──────────────────────────────────────────────────
export const schemas = {
  /** Validates :id URL param as a non-empty string (UUID-ish). */
  idParam: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  /** Standard pagination query params. */
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    search: z.string().trim().optional(),
  }),

  /** Common date range filter. */
  dateRange: z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }).refine(
    (data) => !data.from || !data.to || data.from <= data.to,
    { message: '`from` must be before or equal to `to`', path: ['from'] },
  ),
};
