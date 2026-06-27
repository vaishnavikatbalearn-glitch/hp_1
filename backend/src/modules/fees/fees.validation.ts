import { z } from 'zod';

export const studentFeeParamsSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
});

export const paymentCreateSchema = z.object({
  feeRecordId: z.string().uuid('Invalid fee record ID format'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'ONLINE']),
  transactionId: z.string().trim().min(1).optional(),
  receiptNumber: z.string().trim().min(1, 'Receipt number is required'),
  notes: z.string().trim().optional(),
});

export const paymentUpdateSchema = z
  .object({
    amount: z.coerce.number().positive('Amount must be greater than zero').optional(),
    method: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'ONLINE']).optional(),
    transactionId: z.string().trim().min(1).optional(),
    receiptNumber: z.string().trim().min(1, 'Receipt number is required').optional(),
    notes: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const hasUpdates = Object.values(data).some((value) => value !== undefined);
    if (!hasUpdates) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field must be provided to update the payment',
      });
    }
  });
