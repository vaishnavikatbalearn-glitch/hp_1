import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/response';
import type { AuthenticatedRequest } from '../../types';
import {
  createStaffAccount,
  getStaffAccountById,
  listStaffAccounts,
  updateStaffAccount,
  updateStaffStatus,
} from './admin.service';

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const result = await createStaffAccount(authReq.user.userId, req.body);
  return ApiResponse.created(res, result, 'Staff account created successfully');
});

export const listStaff = asyncHandler(async (_req: Request, res: Response) => {
  const staff = await listStaffAccounts();
  return ApiResponse.ok(res, staff, 'Staff accounts fetched successfully');
});

export const getStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const staff = await getStaffAccountById(id);
  return ApiResponse.ok(res, staff, 'Staff account fetched successfully');
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const staff = await updateStaffAccount(id, req.body);
  return ApiResponse.ok(res, staff, 'Staff account updated successfully');
});

export const patchStaffStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const staff = await updateStaffStatus(id, req.body);
  return ApiResponse.ok(res, staff, 'Staff account status updated successfully');
});
