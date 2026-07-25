import { z } from 'zod';

export const assignRoomSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
  roomId: z.string().uuid('Invalid room ID format'),
});

export const changeRoomSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
  newRoomId: z.string().uuid('Invalid room ID format'),
});

export type AssignRoomBody = z.infer<typeof assignRoomSchema>;
export type ChangeRoomBody = z.infer<typeof changeRoomSchema>;
