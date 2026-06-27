import { prisma } from '../../config/database';
import { AppError } from '../../types/errors';
import type { CreateComplaintBody, UpdateComplaintBody } from './complaint.validation';

export async function createComplaint(userId: string, data: CreateComplaintBody) {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) throw AppError.notFound('Student profile');

  const complaint = await prisma.complaint.create({
    data: {
      studentId: student.id,
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority ?? 2,
      attachmentUrls: data.attachmentUrls ?? [],
      status: 'OPEN',
    },
  });

  return complaint;
}

export async function getMyComplaints(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) throw AppError.notFound('Student profile');

  return prisma.complaint.findMany({ where: { studentId: student.id }, orderBy: { createdAt: 'desc' } });
}

export async function getAllComplaints() {
  return prisma.complaint.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      student: {
        select: { id: true, enrollmentNumber: true, firstName: true, lastName: true, user: { select: { id: true, email: true } } },
      },
    },
  });
}

export async function updateComplaint(complaintId: string, updaterId: string, data: UpdateComplaintBody) {
  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) throw AppError.notFound('Complaint');

  const updateData: any = {};

  if (data.status) {
    updateData.status = data.status;
    if (data.status === 'RESOLVED') {
      updateData.resolvedBy = updaterId;
      updateData.resolvedAt = new Date();
    }
  }

  if (typeof data.assignedTo !== 'undefined') updateData.assignedTo = data.assignedTo;
  if (typeof data.resolution !== 'undefined') updateData.resolution = data.resolution;
  if (typeof data.priority !== 'undefined') updateData.priority = data.priority;
  if (typeof data.attachmentUrls !== 'undefined') updateData.attachmentUrls = data.attachmentUrls;

  return prisma.complaint.update({ where: { id: complaintId }, data: updateData });
}
