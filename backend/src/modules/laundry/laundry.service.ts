import { prisma } from '../../config/database';
import { AppError } from '../../types/errors';
import { Role } from '../../types';
import type { CreateLaundryBody, UpdateLaundryStatusBody } from './laundry.validation';

async function getStudentIdByUserId(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    throw AppError.notFound('Student profile');
  }

  return student.id;
}

export async function createLaundryRequest(userId: string, data: CreateLaundryBody) {
  const studentId = await getStudentIdByUserId(userId);

  return prisma.laundryRequest.create({
    data: {
      studentId,
      itemCount: data.items.reduce((sum, item) => sum + item.qty, 0),
      items: data.items,
      notes: data.notes ?? null,
      status: 'COLLECTED',
      collectedAt: new Date(),
    },
  });
}

export async function getLaundryRequests(userId: string, role: Role) {
  if (role === Role.STUDENT) {
    const studentId = await getStudentIdByUserId(userId);
    return prisma.laundryRequest.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  return prisma.laundryRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      student: {
        select: {
          id: true,
          enrollmentNumber: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export async function updateLaundryRequestStatus(
  laundryId: string,
  updaterId: string,
  role: Role,
  data: UpdateLaundryStatusBody,
) {
  const laundry = await prisma.laundryRequest.findUnique({ where: { id: laundryId } });

  if (!laundry) {
    throw AppError.notFound('Laundry request');
  }

  const updateData: Record<string, unknown> = {
    status: data.status,
    handledBy: updaterId,
  };

  if (data.status === 'WASHING' && !laundry.collectedAt) {
    updateData.collectedAt = new Date();
  }
  if (data.status === 'READY') {
    updateData.readyAt = new Date();
  }
  if (data.status === 'DELIVERED') {
    updateData.deliveredAt = new Date();
  }

  return prisma.laundryRequest.update({
    where: { id: laundryId },
    data: updateData,
  });
}
