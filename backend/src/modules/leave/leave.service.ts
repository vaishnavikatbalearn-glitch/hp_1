import { getStudentIdByUserId } from '../../utils/student';
import { prisma } from '../../config/database';
import { AppError, ErrorCode } from '../../types/errors';
import type { CreateLeaveRequestBody, RejectLeaveRequestBody } from './leave.validation';
import { createNotificationForUser } from '../notification/notification.service';

export async function createLeaveRequest(
  userId: string,
  data: CreateLeaveRequestBody,
) {
  const studentId = await getStudentIdByUserId(userId);

  const overlappingLeave = await prisma.leaveRequest.findFirst({
    where: {
      studentId,
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

  const created = await prisma.leaveRequest.create({
    data: {
      studentId: studentId,
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

  // Notify wardens about new leave request
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, parents: { include: { parent: { include: { user: true } } } } },
    });

    const from = new Date(created.fromDate).toLocaleDateString();
    const to = new Date(created.toDate).toLocaleDateString();
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'A student';

    const wardens = await prisma.user.findMany({ where: { role: 'WARDEN', isActive: true } });
    const notifyPromises: Promise<any>[] = wardens.map((w) =>
      createNotificationForUser(w.id, {
        title: 'New leave request',
        body: `${studentName} submitted a leave request (${from} → ${to})`,
        type: 'LEAVE_REQUEST',
        data: { leaveId: created.id, studentId },
      }),
    );

    // Notify parents (if any)
    if (student?.parents && student.parents.length) {
      student.parents.forEach((p) => {
        const parentUserId = p.parent?.userId;
        if (parentUserId) {
          notifyPromises.push(
            createNotificationForUser(parentUserId, {
              title: 'Leave request submitted',
              body: `Your child ${studentName} submitted a leave request (${from} → ${to})`,
              type: 'LEAVE_REQUEST',
              data: { leaveId: created.id, studentId },
            }),
          );
        }
      });
    }

    await Promise.all(notifyPromises);
  } catch (err) {
    // don't fail the request if notification delivery fails — log and continue
    // logger not imported here; swallow silently for now
  }

  return created;
}

export async function getMyLeaveRequests(userId: string) {
  const studentId = await getStudentIdByUserId(userId);
  return prisma.leaveRequest.findMany({
    where: { studentId },
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

  const updated = await prisma.leaveRequest.update({
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

  // Notify student and parents about approval
  try {
    const leaveWithStudent = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { student: { include: { user: true, parents: { include: { parent: { include: { user: true } } } } } } },
    });

    const studentUserId = leaveWithStudent?.student?.userId;
    const studentName = leaveWithStudent?.student ? `${leaveWithStudent.student.firstName} ${leaveWithStudent.student.lastName}` : 'Your child';
    const from = new Date(updated.fromDate).toLocaleDateString();
    const to = new Date(updated.toDate).toLocaleDateString();

    if (studentUserId) {
      await createNotificationForUser(studentUserId, {
        title: 'Leave approved',
        body: `Your leave request (${from} → ${to}) has been approved`,
        type: 'LEAVE_APPROVED',
        data: { leaveId },
      });
    }

    if (leaveWithStudent?.student?.parents) {
      const parentPromises: Promise<any>[] = [];
      leaveWithStudent.student.parents.forEach((p) => {
        const parentUserId = p.parent?.userId;
        if (parentUserId) {
          parentPromises.push(
            createNotificationForUser(parentUserId, {
              title: 'Leave approved',
              body: `${studentName}'s leave request (${from} → ${to}) was approved`,
              type: 'LEAVE_APPROVED',
              data: { leaveId },
            }),
          );
        }
      });
      await Promise.all(parentPromises);
    }
  } catch (err) {
    // swallow notification errors
  }

  return updated;
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

  const updated = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: 'REJECTED',
      rejectedBy: rejectorId,
      rejectedAt: new Date(),
      rejectionReason: data.rejectionReason,
    },
  });

  // Notify student and parents about rejection
  try {
    const leaveWithStudent = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { student: { include: { user: true, parents: { include: { parent: { include: { user: true } } } } } } },
    });

    const studentUserId = leaveWithStudent?.student?.userId;
    const studentName = leaveWithStudent?.student ? `${leaveWithStudent.student.firstName} ${leaveWithStudent.student.lastName}` : 'Your child';
    const from = new Date(updated.fromDate).toLocaleDateString();
    const to = new Date(updated.toDate).toLocaleDateString();

    if (studentUserId) {
      await createNotificationForUser(studentUserId, {
        title: 'Leave rejected',
        body: `Your leave request (${from} → ${to}) was rejected: ${data.rejectionReason}`,
        type: 'LEAVE_REJECTED',
        data: { leaveId },
      });
    }

    if (leaveWithStudent?.student?.parents) {
      const parentPromises: Promise<any>[] = [];
      leaveWithStudent.student.parents.forEach((p) => {
        const parentUserId = p.parent?.userId;
        if (parentUserId) {
          parentPromises.push(
            createNotificationForUser(parentUserId, {
              title: 'Leave rejected',
              body: `${studentName}'s leave request (${from} → ${to}) was rejected: ${data.rejectionReason}`,
              type: 'LEAVE_REJECTED',
              data: { leaveId },
            }),
          );
        }
      });
      await Promise.all(parentPromises);
    }
  } catch (err) {
    // swallow notification errors
  }

  return updated;
}
