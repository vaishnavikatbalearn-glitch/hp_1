import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import type { AuthenticatedRequest } from '../../types';
import type { CreateVisitorBody, RejectVisitorBody } from './visitor.validation';
import { createVisitorRequest, getMyVisitorRequests, getPendingVisitorRequests, approveVisitorRequest, rejectVisitorRequest } from './visitor.service';

export const submitVisitor = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const body = req.body as CreateVisitorBody;
  const visitor = await createVisitorRequest(authReq.user.userId, body);
  return ApiResponse.created(res, visitor, 'Visitor request submitted');
});

export const myVisitors = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const visitors = await getMyVisitorRequests(authReq.user.userId);
  return ApiResponse.ok(res, visitors, 'Your visitor requests');
});

export const pendingVisitors = asyncHandler(async (_req: Request, res: Response) => {
  const visitors = await getPendingVisitorRequests();
  return ApiResponse.ok(res, visitors, 'Pending visitor requests');
});

export const approveVisitor = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const id = req.params.id;
  const result = await approveVisitorRequest(id, authReq.user.userId);
  return ApiResponse.ok(res, result, 'Visitor approved');
});

export const rejectVisitor = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const id = req.params.id;
  const body = req.body as RejectVisitorBody;
  const result = await rejectVisitorRequest(id, authReq.user.userId, body);
  return ApiResponse.ok(res, result, 'Visitor rejected');
});
