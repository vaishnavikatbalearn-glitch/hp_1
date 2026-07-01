import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import type { AuthenticatedRequest } from '../../types';
import type { CreateLeaveRequestBody, RejectLeaveRequestBody } from './leave.validation';
import {
  createLeaveRequest,
  getMyLeaveRequests,
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from './leave.service';

const formatLeave = (leave: any) => ({
  id: leave.id,
  studentId: leave.studentId,
  reason: leave.reason,
  startDate: leave.fromDate,
  endDate: leave.toDate,
  destination: leave.destination,
  contactNumber: leave.contactAtLeave,
  status: leave.status,
  createdAt: leave.createdAt,
  updatedAt: leave.updatedAt,
  approvedBy: leave.approvedBy,
  approvedAt: leave.approvedAt,
  rejectedBy: leave.rejectedBy,
  rejectedAt: leave.rejectedAt,
  rejectionReason: leave.rejectionReason,
});

export const createLeave = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const body = req.body as CreateLeaveRequestBody;
  const leave = await createLeaveRequest(authReq.user.userId, body);
  return ApiResponse.created(res, formatLeave(leave), 'Leave request submitted');
});

export const getStudentLeaves = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const leaves = await getMyLeaveRequests(authReq.user.userId);
  return ApiResponse.ok(res, leaves.map(formatLeave), 'Student leave requests');
});

export const getWardenLeaves = asyncHandler(async (_req: Request, res: Response) => {
  const leaves = await getPendingLeaveRequests();
  return ApiResponse.ok(res, leaves.map(formatLeave), 'Pending leave requests');
});

export const approveLeave = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const leaveId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const leave = await approveLeaveRequest(leaveId, authReq.user.userId);
  return ApiResponse.ok(res, formatLeave(leave), 'Leave request approved');
});

export const rejectLeave = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const leaveId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const body = req.body as RejectLeaveRequestBody;
  const leave = await rejectLeaveRequest(leaveId, authReq.user.userId, body);
  return ApiResponse.ok(res, formatLeave(leave), 'Leave request rejected');
});
