import { z } from 'zod';

export const createLaundrySchema = z.object({
  items: z.array(
    z.object({
      name: z.string().min(1, 'Item name is required'),
      qty: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    }),
  ).min(1, 'At least one laundry item is required'),
  notes: z.string().trim().max(1000).optional(),
});

export const updateLaundryStatusSchema = z.object({
  status: z.enum(['COLLECTED', 'WASHING', 'DRYING', 'READY', 'DELIVERED']),
});

export type CreateLaundryBody = z.infer<typeof createLaundrySchema>;
export type UpdateLaundryStatusBody = z.infer<typeof updateLaundryStatusSchema>;
