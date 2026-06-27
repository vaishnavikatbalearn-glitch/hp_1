import { z } from 'zod';

export const createComplaintSchema = z.object({
  category: z.enum(["MAINTENANCE", "MESS", "LAUNDRY", "ROOMMATE", "STAFF", "SECURITY", "OTHER"]),
  subject: z.string().min(3, 'Subject is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.number().int().min(1).max(3).optional(),
  attachmentUrls: z.array(z.string().url()).optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
  assignedTo: z.string().uuid().optional(),
  resolution: z.string().optional(),
  priority: z.number().int().min(1).max(3).optional(),
  attachmentUrls: z.array(z.string().url()).optional(),
});

export type CreateComplaintBody = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintBody = z.infer<typeof updateComplaintSchema>;
