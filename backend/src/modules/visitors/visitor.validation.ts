import { z } from 'zod';

export const createVisitorSchema = z.object({
  visitorName: z.string().min(2, 'Visitor name is required'),
  visitorPhone: z.string().min(6, 'Phone is required'),
  relation: z.string().optional(),
  purpose: z.string().min(5, 'Purpose is required'),
  expectedDate: z.preprocess((v) => (v ? new Date(v as string) : undefined), z.date()),
  expectedDuration: z.number().int().min(1).max(60 * 24).optional(),
  idProofType: z.string().optional(),
  idProofNumber: z.string().optional(),
});

export const rejectVisitorSchema = z.object({
  reason: z.string().min(3, 'Reason is required'),
});

export type CreateVisitorBody = z.infer<typeof createVisitorSchema>;
export type RejectVisitorBody = z.infer<typeof rejectVisitorSchema>;
