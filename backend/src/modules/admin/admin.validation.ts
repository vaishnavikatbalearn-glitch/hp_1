import { z } from 'zod';

export const createStaffSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().min(7, 'Mobile number is required'),
  role: z.enum(['ADMIN', 'WARDEN', 'TRUSTEE', 'ACCOUNTANT', 'LAUNDRY_STAFF']),
  hostelId: z.string().uuid('Invalid hostel ID format'),
});

export const activateStaffSchema = z.object({
  token: z.string().trim().min(1, 'Activation token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateStaffSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').optional(),
  email: z.string().trim().email('Valid email is required').optional(),
  phone: z.string().trim().min(7, 'Mobile number is required').optional(),
  role: z.enum(['ADMIN', 'WARDEN', 'TRUSTEE', 'ACCOUNTANT', 'LAUNDRY_STAFF']).optional(),
  hostelId: z.string().uuid('Invalid hostel ID format').optional(),
});

export const updateStaffStatusSchema = z.object({
  status: z.enum(['PENDING_ACTIVATION', 'ACTIVE', 'SUSPENDED']),
});

export const resetStaffPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits').optional(),
});

export type CreateStaffBody = z.infer<typeof createStaffSchema>;
export type ActivateStaffBody = z.infer<typeof activateStaffSchema>;
export type UpdateStaffBody = z.infer<typeof updateStaffSchema>;
export type UpdateStaffStatusBody = z.infer<typeof updateStaffStatusSchema>;
export type ResetStaffPasswordBody = z.infer<typeof resetStaffPasswordSchema>;
