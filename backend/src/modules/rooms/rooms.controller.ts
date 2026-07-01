import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/response';
import { listFloors, listRooms } from './rooms.service';

export const getRooms = asyncHandler(async (_req: Request, res: Response) => {
  const rooms = await listRooms();
  return ApiResponse.ok(res, rooms);
});

export const getFloors = asyncHandler(async (_req: Request, res: Response) => {
  const floors = await listFloors();
  return ApiResponse.ok(res, floors);
});
