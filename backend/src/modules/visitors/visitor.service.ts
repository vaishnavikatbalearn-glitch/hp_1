import { prisma } from '../../config/database';
import { AppError } from '../../types/errors';
import type { CreateVisitorBody, RejectVisitorBody } from './visitor.validation';

export async function createVisitorRequest(userId: string, data: CreateVisitorBody) {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) throw AppError.notFound('Student profile');

  const visitor = await prisma.visitorRequest.create({
    data: {
      studentId: student.id,
      visitorName: data.visitorName,
      visitorPhone: data.visitorPhone,
      relation: data.relation ?? '',
      purpose: data.purpose,
      expectedDate: data.expectedDate,
      expectedDuration: data.expectedDuration ?? 60,
      idProofType: data.idProofType ?? null,
      idProofNumber: data.idProofNumber ?? null,
      status: 'PENDING',
    },
  });

  return visitor;
}

export async function getMyVisitorRequests(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) throw AppError.notFound('Student profile');

  return prisma.visitorRequest.findMany({ where: { studentId: student.id }, orderBy: { createdAt: 'desc' } });
}

export async function getPendingVisitorRequests() {
  return prisma.visitorRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: {
      student: {
        select: {
          id: true,
          enrollmentNumber: true,
          firstName: true,
          lastName: true,
          user: { select: { id: true, email: true } },
        },
      },
    },
  });
}

export async function approveVisitorRequest(id: string, approverId: string) {
  const v = await prisma.visitorRequest.findUnique({ where: { id } });
  if (!v) throw AppError.notFound('Visitor request');
  if (v.status !== 'PENDING') throw AppError.conflict('Only pending visitor requests can be approved');

  return prisma.visitorRequest.update({ where: { id }, data: { status: 'APPROVED', approvedBy: approverId, approvedAt: new Date() } });
}

export async function rejectVisitorRequest(id: string, rejectorId: string, _data: RejectVisitorBody) {
  const v = await prisma.visitorRequest.findUnique({ where: { id } });
  if (!v) throw AppError.notFound('Visitor request');
  if (v.status !== 'PENDING') throw AppError.conflict('Only pending visitor requests can be rejected');

  // Model doesn't have explicit rejectedBy; mark approvedBy and approvedAt for audit and set status
  return prisma.visitorRequest.update({ where: { id }, data: { status: 'REJECTED', approvedBy: rejectorId, approvedAt: new Date() } });
}
