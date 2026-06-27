import { z } from 'zod';

export const markAttendanceSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  date: z.coerce.date().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'ON_LEAVE']),
  remarks: z.string().trim().max(500).optional(),
});

export const attendanceIdParam = z.object({
  studentId: z.string().uuid('Invalid student ID').optional(),
  id: z.string().uuid('Invalid attendance ID').optional(),
});

export const attendanceSummaryQuery = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export type MarkAttendanceBody = z.infer<typeof markAttendanceSchema>;
export type AttendanceIdParams = z.infer<typeof attendanceIdParam>;
export type AttendanceSummaryQuery = z.infer<typeof attendanceSummaryQuery>;
