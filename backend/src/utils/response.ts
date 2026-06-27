import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { ApiSuccessResponse, PaginatedResult, PaginationMeta } from '../types';

// ─── Response Utility ─────────────────────────────────────────────────────────
/**
 * Centralised response helpers that enforce the API envelope format.
 *
 * All API responses share the shape:
 * { success, statusCode, message, data, meta?, requestId, timestamp }
 */
export class ApiResponse {
  // ── Success Responses ───────────────────────────────────────────────────────

  /** 200 OK */
  static ok<T>(
    res: Response,
    data: T,
    message = 'Success',
    meta?: Record<string, unknown>,
  ): Response {
    return ApiResponse._send(res, StatusCodes.OK, message, data, meta);
  }

  /** 201 Created */
  static created<T>(res: Response, data: T, message = 'Resource created'): Response {
    return ApiResponse._send(res, StatusCodes.CREATED, message, data);
  }

  /** 204 No Content */
  static noContent(res: Response): Response {
    return res.status(StatusCodes.NO_CONTENT).send();
  }

  /** Paginated list response */
  static paginated<T>(
    res: Response,
    result: PaginatedResult<T>,
    message = 'Success',
  ): Response {
    return ApiResponse._send(res, StatusCodes.OK, message, result.data, {
      pagination: result.pagination,
    });
  }

  // ── Private Builder ─────────────────────────────────────────────────────────
  private static _send<T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T,
    meta?: Record<string, unknown>,
  ): Response {
    const body: ApiSuccessResponse<T> = {
      success: true,
      statusCode,
      message,
      data,
      ...(meta ? { meta } : {}),
      requestId: (res.req as { requestId?: string }).requestId,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(body);
  }
}

// ─── Pagination Helper ────────────────────────────────────────────────────────
/**
 * Build a PaginationMeta object from raw counts.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Calculate Prisma `skip` from page + limit.
 */
export function getPrismaSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
