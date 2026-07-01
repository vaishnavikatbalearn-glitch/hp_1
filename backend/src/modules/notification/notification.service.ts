import { prisma } from '../../config/database';
import { AppError } from '../../types/errors';
import type { Prisma } from '@prisma/client';

export interface CreateNotificationInput {
  title: string;
  body: string;
  type?: string;
  data?: Record<string, unknown> | null;
}

export async function getNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createNotificationForUser(userId: string, input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId,
      title: input.title,
      body: input.body,
      type: input.type ?? 'GENERAL',
      data: input.data ? (input.data as unknown as Prisma.JsonObject) : undefined,
    },
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    throw AppError.notFound('Notification');
  }

  return prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}
