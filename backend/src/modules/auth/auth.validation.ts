import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required').optional(),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits').optional(),
}).refine((data) => data.password || data.otp, {
  message: 'Either password or OTP is required',
  path: ['password'],
});

export const requestOtpSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const activateAccountSchema = z.object({
  token: z.string().trim().min(1, 'Activation token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterRequestBody = z.infer<typeof registerSchema>;
export type LoginRequestBody = z.infer<typeof loginSchema>;
export type RequestOtpBody = z.infer<typeof requestOtpSchema>;
export type ResendOtpBody = z.infer<typeof resendOtpSchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpSchema>;
export type ActivateAccountBody = z.infer<typeof activateAccountSchema>;
