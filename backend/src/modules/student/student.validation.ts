import { z } from 'zod';

export const createStudentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  hostelId: z.string().uuid('Invalid hostel ID'),
  enrollmentNumber: z.string().min(1, 'Enrollment number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.string().min(1, 'Gender is required'),
  dateOfBirth: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date of birth'),
  phone: z.string().min(10, 'Phone is required'),
  emergencyPhone: z.string().min(10, 'Emergency phone is required'),
  bloodGroup: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pinCode: z.string().min(1, 'Pin code is required'),
  course: z.string().min(1, 'Course is required'),
  year: z.number().int().min(1, 'Year is required'),
  branch: z.string().min(1, 'Branch is required'),
  college: z.string().min(1, 'College is required'),
  admissionDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid admission date'),
  vacateDate: z.string().optional().refine((value) => value === undefined || !Number.isNaN(Date.parse(value)), 'Invalid vacate date'),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  id: z.string().uuid('Invalid student ID'),
});

export const studentIdParam = z.object({
  id: z.string().uuid('Invalid student ID'),
});

export type CreateStudentBody = z.infer<typeof createStudentSchema>;
export type UpdateStudentBody = z.infer<typeof updateStudentSchema>;
export type StudentIdParams = z.infer<typeof studentIdParam>;
