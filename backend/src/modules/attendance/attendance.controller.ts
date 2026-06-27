import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import type { AuthenticatedRequest } from '../../types';
import type { MarkAttendanceBody, AttendanceSummaryQuery } from './attendance.validation';
import {
  createAttendanceRecord,
  listStudentAttendance,
  listTodayAttendance,
  getAttendanceSummary,
  modifyAttendance,
} from './attendance.service';

export const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const body = req.body as MarkAttendanceBody;
  const attendance = await createAttendanceRecord(body, authReq.user.userId);
  return res.status(201).json({ success: true, message: 'Attendance marked', data: attendance });
});

export const getStudentAttendance = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as { studentId: string };
  const records = await listStudentAttendance(params.studentId);
  return res.status(200).json({ success: true, message: 'Student attendance retrieved', data: records });
});

export const getTodayAttendance = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const records = await listTodayAttendance(authReq.user.role);
  return res.status(200).json({ success: true, message: 'Today attendance retrieved', data: records });
});

export const getAttendanceSummary = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as AttendanceSummaryQuery;
  const summary = await getAttendanceSummary(query);
  return res.status(200).json({ success: true, message: 'Attendance summary retrieved', data: summary });
});

export const updateAttendance = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const params = req.params as { id: string };
  const body = req.body as MarkAttendanceBody;
  const attendance = await modifyAttendance(params.id, body, authReq.user.userId);
  return res.status(200).json({ success: true, message: 'Attendance updated', data: attendance });
});
