import { z } from 'zod';

export const createLeaveSchema = z
  .object({
    type: z.enum(['HOME', 'MEDICAL', 'EMERGENCY', 'PERSONAL', 'OTHER']).optional(),
    startDate: z.preprocess((value) => {
      if (value instanceof Date) return value;
      if (typeof value === 'string') return new Date(value);
      return undefined;
    }, z.date()),
    endDate: z.preprocess((value) => {
      if (value instanceof Date) return value;
      if (typeof value === 'string') return new Date(value);
      return undefined;
    }, z.date()),
    reason: z.string().min(10, 'Reason is required and must be at least 10 characters'),
    destination: z.string().min(1, 'Destination is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'startDate must be before or equal to endDate',
    path: ['startDate'],
  });

export const rejectLeaveSchema = z.object({
  rejectionReason: z.string().min(5, 'Rejection reason is required'),
});

export type CreateLeaveRequestBody = z.infer<typeof createLeaveSchema>;
export type RejectLeaveRequestBody = z.infer<typeof rejectLeaveSchema>;
