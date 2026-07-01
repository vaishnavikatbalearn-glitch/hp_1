import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/response';
import type { AuthenticatedRequest } from '../../types';
import {
  getNotificationsForUser,
  createNotificationForUser,
  markNotificationAsRead,
} from './notification.service';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;

  if (!userId) {
    return ApiResponse.ok(res, [], 'User not authenticated');
  }

  const notifications = await getNotificationsForUser(userId);
  return ApiResponse.ok(res, notifications, 'Notifications fetched successfully');
});

export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;

  if (!userId) {
    return ApiResponse.ok(res, null, 'User not authenticated');
  }

  const { title, body, type, data } = req.body ?? {};

  if (!title || !body) {
    return ApiResponse.ok(res, null, 'Title and body are required');
  }

  const notification = await createNotificationForUser(userId, {
    title,
    body,
    type,
    data,
  });

  return ApiResponse.created(res, notification, 'Notification created successfully');
});

export const readNotification = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.userId;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!userId) {
    return ApiResponse.ok(res, null, 'User not authenticated');
  }

  const notification = await markNotificationAsRead(id, userId);
  return ApiResponse.ok(res, notification, 'Notification marked as read');
});
