import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import type { AuthenticatedRequest } from '../../types';
import { paymentCreateSchema, paymentUpdateSchema } from './fees.validation';
import {
  createFeePayment,
  listPendingFees,
  listStudentFeeHistory,
  listStudentFees,
  updateFeePayment,
} from './fees.service';
import type { z } from 'zod';

type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>;

export const getStudentFees = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as { studentId: string };
  const fees = await listStudentFees(params.studentId);
  return res.status(200).json({ success: true, message: 'Student fees retrieved', data: fees });
});

export const getStudentFeeHistory = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as { studentId: string };
  const history = await listStudentFeeHistory(params.studentId);
  return res.status(200).json({ success: true, message: 'Student fee history retrieved', data: history });
});

export const getPendingFees = asyncHandler(async (_req: Request, res: Response) => {
  const fees = await listPendingFees();
  return res.status(200).json({ success: true, message: 'Pending fees retrieved', data: fees });
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const body = req.body as PaymentCreateInput;
  const payment = await createFeePayment(body, authReq.user.userId);
  return res.status(201).json({ success: true, message: 'Payment recorded', data: payment });
});

export const editPayment = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const params = req.params as { id: string };
  const body = req.body as PaymentUpdateInput;
  const payment = await updateFeePayment(params.id, body, authReq.user.userId);
  return res.status(200).json({ success: true, message: 'Payment updated', data: payment });
});
