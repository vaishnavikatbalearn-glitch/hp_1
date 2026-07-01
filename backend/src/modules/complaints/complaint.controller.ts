import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import type { AuthenticatedRequest } from '../../types';
import type { CreateComplaintBody, UpdateComplaintBody } from './complaint.validation';
import { createComplaint, getMyComplaints, getAllComplaints, updateComplaint } from './complaint.service';
import { getComplaintTimeline } from './complaint.service';

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

export const listComplaints = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query;
  const filters: any = {};
  if (q.search) filters.search = Array.isArray(q.search) ? q.search[0] : q.search;
  if (q.status) filters.status = q.status;
  if (q.category) filters.category = Array.isArray(q.category) ? q.category[0] : q.category;
  if (q.priority) filters.priority = Number(Array.isArray(q.priority) ? q.priority[0] : q.priority);
  if (q.assignedTo) filters.assignedTo = Array.isArray(q.assignedTo) ? q.assignedTo[0] : q.assignedTo;

  const complaints = await getAllComplaints(filters);
  return ApiResponse.ok(res, complaints, 'Complaints list');
});

export const patchComplaint = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const body = req.body as UpdateComplaintBody;
  const updated = await updateComplaint(id, authReq.user.userId, body);
  return ApiResponse.ok(res, updated, 'Complaint updated');
});

export const complaintTimeline = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const timeline = await getComplaintTimeline(id);
  return ApiResponse.ok(res, timeline, 'Complaint timeline');
});
