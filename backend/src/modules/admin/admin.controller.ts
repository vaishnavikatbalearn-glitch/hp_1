import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/response';
import type { AuthenticatedRequest } from '../../types';
import {
  activateStaffAccountByToken,
  createStaffAccount,
  disableStaffAccount,
  enableStaffAccount,
  getStaffAccountById,
  listStaffAccounts,
  resetStaffPassword,
  sendStaffOtp,
  updateStaffAccount,
  updateStaffStatus,
} from './admin.service';

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const result = await createStaffAccount(authReq.user.userId, req.body);
  return ApiResponse.created(res, result, 'Staff account created successfully');
});

export const activateAccount = asyncHandler(async (req: Request, res: Response) => {
  const result = await activateStaffAccountByToken(req.body);
  return ApiResponse.ok(res, result, 'Account activated successfully');
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

export const disableStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const staff = await disableStaffAccount(id);
  return ApiResponse.ok(res, staff, 'Staff account disabled successfully');
});

export const enableStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const staff = await enableStaffAccount(id);
  return ApiResponse.ok(res, staff, 'Staff account enabled successfully');
});

export const sendStaffOtpHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await sendStaffOtp(id);
  return ApiResponse.ok(res, result, 'OTP sent successfully');
});

export const resetStaffPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await resetStaffPassword(id, req.body);
  return ApiResponse.ok(res, result, 'Password reset successfully');
});
