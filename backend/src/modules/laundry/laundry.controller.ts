import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import type { AuthenticatedRequest } from '../../types';
import type { CreateLaundryBody, UpdateLaundryStatusBody } from './laundry.validation';
import { createLaundryRequest, getLaundryRequests, updateLaundryRequestStatus } from './laundry.service';

export const submitLaundryRequest = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const body = req.body as CreateLaundryBody;
  const laundry = await createLaundryRequest(authReq.user.userId, body);
  return ApiResponse.created(res, laundry, 'Laundry request submitted');
});

export const listLaundryRequests = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const laundryHistory = await getLaundryRequests(authReq.user.userId, authReq.user.role);
  return ApiResponse.ok(res, laundryHistory, 'Laundry requests retrieved');
});

export const patchLaundryStatus = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const laundryId = req.params.id;
  const body = req.body as UpdateLaundryStatusBody;
  const updatedLaundry = await updateLaundryRequestStatus(laundryId, authReq.user.userId, authReq.user.role, body);
  return ApiResponse.ok(res, updatedLaundry, 'Laundry status updated');
});
