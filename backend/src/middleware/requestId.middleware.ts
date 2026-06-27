import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

// ─── Request ID Middleware ─────────────────────────────────────────────────────
/**
 * Attaches a unique requestId to every incoming request.
 * The ID is propagated in the `X-Request-Id` response header.
 * Downstream middleware, services, and logs can reference req.requestId.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'];
  const requestId =
    typeof incomingId === 'string' && incomingId.length > 0
      ? incomingId                // honour upstream-provided IDs (e.g. from a gateway)
      : uuidv4();

  req.requestId = requestId;
  req.startTime = Date.now();

  // Echo back in response
  res.setHeader('X-Request-Id', requestId);

  next();
}
