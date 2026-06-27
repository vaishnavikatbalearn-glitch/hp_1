import { prisma } from '../../config/database';
import { AppError, ErrorCode } from '../../types/errors';
import type { CreateLeaveRequestBody, RejectLeaveRequestBody } from './leave.validation';

export async function createLeaveRequest(
  userId: string,
  data: CreateLeaveRequestBody,
) {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    throw AppError.notFound('Student profile');
  }

  const overlappingLeave = await prisma.leaveRequest.findFirst({
    where: {
      studentId: student.id,
      status: { in: ['PENDING', 'APPROVED'] },
      AND: [
        { fromDate: { lte: data.endDate } },
        { toDate: { gte: data.startDate } },
      ],
    },
  });

  if (overlappingLeave) {
    throw AppError.conflict(
      'Leave dates overlap an existing leave request',
      ErrorCode.LEAVE_OVERLAP,
    );
  }

  return prisma.leaveRequest.create({
    data: {
      studentId: student.id,
      type: data.type ?? 'HOME',
      fromDate: data.startDate,
      toDate: data.endDate,
      reason: data.reason,
      destination: data.destination,
      contactAtLeave: data.contactNumber,
      parentConsent: false,
      attachmentUrls: [],
    },
  });
}

export async function getMyLeaveRequests(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    throw AppError.notFound('Student profile');
  }

  return prisma.leaveRequest.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPendingLeaveRequests() {
  return prisma.leaveRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  });
}

export async function approveLeaveRequest(leaveId: string, approverId: string) {
  const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });

  if (!leave) {
    throw AppError.notFound('Leave request');
  }

  if (leave.status !== 'PENDING') {
    throw AppError.conflict('Only pending leave requests can be approved');
  }

  return prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: 'APPROVED',
      approvedBy: approverId,
      approvedAt: new Date(),
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
    },
  });
}

export async function rejectLeaveRequest(
  leaveId: string,
  rejectorId: string,
  data: RejectLeaveRequestBody,
) {
  const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });

  if (!leave) {
    throw AppError.notFound('Leave request');
  }

  if (leave.status !== 'PENDING') {
    throw AppError.conflict('Only pending leave requests can be rejected');
  }

  return prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: 'REJECTED',
      rejectedBy: rejectorId,
      rejectedAt: new Date(),
      rejectionReason: data.rejectionReason,
    },
  });
}
