import { Request, Response, NextFunction, RequestHandler } from 'express';

// ─── Async Handler Wrapper ────────────────────────────────────────────────────
/**
 * Wraps an async route handler to automatically catch rejected promises
 * and pass them to Express's next(error) — eliminating try/catch boilerplate.
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.findAll();
 *   ApiResponse.ok(res, users);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>,
): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Typed version for authenticated routes.
 */
export const authHandler = <TReq extends Request>(
  fn: (req: TReq, res: Response, next: NextFunction) => Promise<void | Response>,
): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as TReq, res, next)).catch(next);
  };
