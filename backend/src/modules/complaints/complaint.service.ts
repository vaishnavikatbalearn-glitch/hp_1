import { getStudentIdByUserId } from '../../utils/student';
import { prisma } from '../../config/database';
import { AppError } from '../../types/errors';
import type { CreateComplaintBody, UpdateComplaintBody } from './complaint.validation';
import { createNotificationForUser } from '../notification/notification.service';

export async function createComplaint(userId: string, data: CreateComplaintBody) {
  const studentId = await getStudentIdByUserId(userId);

  const complaint = await prisma.complaint.create({
    data: {
      studentId,
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority ?? 2,
      attachmentUrls: data.attachmentUrls ?? [],
      status: 'OPEN',
    },
  });

  // Notify wardens/admins about new complaint
  try {
    const student = await prisma.student.findUnique({ where: { id: studentId }, include: { user: true } });
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'A student';

    const recipients = await prisma.user.findMany({ where: { role: { in: ['WARDEN', 'ADMIN'] }, isActive: true } });
    const notifyPromises: Promise<any>[] = recipients.map((u) =>
      createNotificationForUser(u.id, {
        title: 'New complaint submitted',
        body: `${studentName} submitted a complaint: ${data.subject}`,
        type: 'COMPLAINT_CREATED',
        data: { complaintId: complaint.id, studentId },
      }),
    );

    // Acknowledge student (if user exists)
    if (student?.user) {
      notifyPromises.push(
        createNotificationForUser(student.user.id, {
          title: 'Complaint submitted',
          body: `Your complaint "${data.subject}" has been submitted and is pending review.`,
          type: 'COMPLAINT_SUBMITTED',
          data: { complaintId: complaint.id },
        }),
      );
    }

    await Promise.all(notifyPromises);
  } catch (err) {
    // swallow notification errors
  }

  // Create audit log entry
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.auditLog.create({
      data: {
        userId: userId,
        userRole: user?.role ?? 'STUDENT',
        action: 'complaint.created',
        entity: 'Complaint',
        entityId: complaint.id,
        newValues: { subject: complaint.subject, status: complaint.status },
      },
    });
  } catch (err) {
    // swallow audit errors
  }

  return complaint;
}

export async function getComplaintTimeline(complaintId: string) {
  return prisma.auditLog.findMany({
    where: { entity: 'Complaint', entityId: complaintId },
    orderBy: { timestamp: 'asc' },
  });
}

export async function getMyComplaints(userId: string) {
  const studentId = await getStudentIdByUserId(userId);
  return prisma.complaint.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } });
}

export async function getAllComplaints(filters?: { search?: string; status?: string | string[]; category?: string; priority?: number; assignedTo?: string }) {
  const where: any = {};

  if (filters) {
    const { search, status, category, priority, assignedTo } = filters;

    if (status) {
      if (Array.isArray(status)) where.status = { in: status };
      else where.status = status;
    }

    if (category) where.category = category;
    if (typeof priority !== 'undefined') where.priority = Number(priority);
    if (assignedTo) where.assignedTo = assignedTo;

    if (search) {
      const s = search.trim();
      where.OR = [
        { subject: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
        { student: { firstName: { contains: s, mode: 'insensitive' } } },
        { student: { lastName: { contains: s, mode: 'insensitive' } } },
        { student: { enrollmentNumber: { contains: s, mode: 'insensitive' } } },
      ];
    }
  }

  return prisma.complaint.findMany({
    where,
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

  const updated = await prisma.complaint.update({ where: { id: complaintId }, data: updateData });

  // If complaint resolved, notify student
  try {
    if (updateData.status === 'RESOLVED') {
      const c = await prisma.complaint.findUnique({ where: { id: complaintId }, include: { student: { include: { user: true } } } });
      const studentUserId = c?.student?.user?.id;
      if (studentUserId) {
        await createNotificationForUser(studentUserId, {
          title: 'Complaint resolved',
          body: `Your complaint "${c.subject}" has been resolved.`,
          type: 'COMPLAINT_RESOLVED',
          data: { complaintId },
        });
      }
    }
  } catch (err) {
    // swallow notification errors
  }

  // Create audit log entry for update
  try {
    const user = await prisma.user.findUnique({ where: { id: updaterId } });
    await prisma.auditLog.create({
      data: {
        userId: updaterId,
        userRole: user?.role ?? 'ADMIN',
        action: updateData.status ? `complaint.status_changed` : 'complaint.updated',
        entity: 'Complaint',
        entityId: complaintId,
        oldValues: { status: complaint.status, assignedTo: complaint.assignedTo ?? null },
        newValues: { status: updated.status, assignedTo: updated.assignedTo ?? null },
      },
    });
  } catch (err) {
    // swallow audit errors
  }

  return updated;
}
