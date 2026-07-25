import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/response';
import { assignRoom, changeRoom, listFloors, listRooms } from './rooms.service';
import type { AssignRoomBody, ChangeRoomBody } from './rooms.validation';

export const getRooms = asyncHandler(async (_req: Request, res: Response) => {
  const rooms = await listRooms();
  return ApiResponse.ok(res, rooms);
});

export const getFloors = asyncHandler(async (_req: Request, res: Response) => {
  const floors = await listFloors();
  return ApiResponse.ok(res, floors);
});

export const assignRoomToStudent = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as AssignRoomBody;
  const allocation = await assignRoom(body.studentId, body.roomId);
  return ApiResponse.created(res, allocation);
});

export const changeStudentRoom = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as ChangeRoomBody;
  const allocation = await changeRoom(body.studentId, body.newRoomId);
  return ApiResponse.ok(res, allocation);
});
