import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import type { AuthenticatedRequest } from '../../types';
import type { CreateComplaintBody, UpdateComplaintBody } from './complaint.validation';
import { createComplaint, getMyComplaints, getAllComplaints, updateComplaint } from './complaint.service';

export const submitComplaint = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const body = req.body as CreateComplaintBody;
  const complaint = await createComplaint(authReq.user.userId, body);
  return ApiResponse.created(res, complaint, 'Complaint submitted');
});

export const myComplaints = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const complaints = await getMyComplaints(authReq.user.userId);
  return ApiResponse.ok(res, complaints, 'Your complaints');
});

export const listComplaints = asyncHandler(async (_req: Request, res: Response) => {
  const complaints = await getAllComplaints();
  return ApiResponse.ok(res, complaints, 'Complaints list');
});

export const patchComplaint = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const id = req.params.id;
  const body = req.body as UpdateComplaintBody;
  const updated = await updateComplaint(id, authReq.user.userId, body);
  return ApiResponse.ok(res, updated, 'Complaint updated');
});
