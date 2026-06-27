import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendError } from '../../utils/response';
import {
  getNotificationsForUser,
  createNotificationForUser,
  markNotificationAsRead,
} from './notification.service';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  const notifications = await getNotificationsForUser(userId);
  return sendSuccess(res, notifications, 'Notifications fetched successfully');
});

export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  const { title, body, type, data } = req.body ?? {};

  if (!title || !body) {
    return sendError(res, 'Title and body are required', 400);
  }

  const notification = await createNotificationForUser(userId, {
    title,
    body,
    type,
    data,
  });

  return sendSuccess(res, notification, 'Notification created successfully', 201);
});

export const readNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return sendError(res, 'User not authenticated', 401);
  }

  try {
    const notification = await markNotificationAsRead(id, userId);
    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    if (error instanceof Error && error.message === 'Notification not found') {
      return sendError(res, error.message, 404);
    }

    throw error;
  }
});
