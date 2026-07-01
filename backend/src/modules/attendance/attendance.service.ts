import { prisma } from '../../config/database';
import { AppError } from '../../types/errors';
import type { MarkAttendanceBody, AttendanceSummaryQuery } from './attendance.validation';
import { Role } from '../../types';

export async function createAttendanceRecord(data: MarkAttendanceBody, markedBy: string) {
  const attendanceDate = data.date ? new Date(data.date) : new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findUnique({
    where: {
      studentId_date: {
        studentId: data.studentId,
        date: attendanceDate,
      },
    },
  });

  if (existing) {
    throw AppError.conflict('Attendance already marked for this student and date');
  }

  return prisma.attendance.create({
    data: {
      studentId: data.studentId,
      date: attendanceDate,
      status: data.status,
      remarks: data.remarks ?? null,
      markedBy,
    },
  });
}

export async function listStudentAttendance(studentId: string) {
  return prisma.attendance.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
  });
}

export async function listTodayAttendance(role: Role) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (role === Role.STUDENT) {
    return prisma.attendance.findMany({
      where: { date: today },
      orderBy: { studentId: 'asc' },
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

  return prisma.attendance.findMany({
    where: { date: today },
    orderBy: { studentId: 'asc' },
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

export async function getAttendanceSummary(query: AttendanceSummaryQuery) {
  const now = new Date();
  const month = query.month ?? now.getMonth() + 1;
  const year = query.year ?? now.getFullYear();

  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);
  to.setHours(23, 59, 59, 999);

  const total = await prisma.attendance.count({
    where: { date: { gte: from, lte: to } },
  });

  const present = await prisma.attendance.count({
    where: { date: { gte: from, lte: to }, status: 'PRESENT' },
  });

  const absent = await prisma.attendance.count({
    where: { date: { gte: from, lte: to }, status: 'ABSENT' },
  });

  const late = await prisma.attendance.count({
    where: { date: { gte: from, lte: to }, status: 'LATE' },
  });

  const onLeave = await prisma.attendance.count({
    where: { date: { gte: from, lte: to }, status: 'ON_LEAVE' },
  });

  const daily = await prisma.$queryRaw<
    Array<{ date: string; present: number; absent: number; onLeave: number; late: number }>
  >`
    SELECT to_char(date, 'YYYY-MM-DD') AS date,
      COUNT(*) FILTER (WHERE status = 'PRESENT') AS present,
      COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent,
      COUNT(*) FILTER (WHERE status = 'ON_LEAVE') AS "onLeave"
      , COUNT(*) FILTER (WHERE status = 'LATE') AS late
    FROM attendances
    WHERE date BETWEEN ${from} AND ${to}
    GROUP BY date
    ORDER BY date ASC;
  `;

  const hostel = {
    total,
    present,
    absent,
    onLeave,
    late,
    percentage: total ? Math.round((present / total) * 100) : 0,
  };

  return {
    dateRange: { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) },
    daily,
    monthly: hostel,
    hostel,
    department: {
      // Placeholder: aggregate by department is not available yet; return totals.
      total,
      present,
      absent,
      onLeave,
      late,
      percentage: hostel.percentage,
    },
    overallPercentage: hostel.percentage,
  };
}

export async function modifyAttendance(id: string, data: MarkAttendanceBody, markedBy: string) {
  const attendance = await prisma.attendance.findUnique({ where: { id } });
  if (!attendance) {
    throw AppError.notFound('Attendance record');
  }

  return prisma.attendance.update({
    where: { id },
    data: {
      status: data.status,
      remarks: data.remarks ?? attendance.remarks,
      markedBy,
      date: data.date ? new Date(data.date) : attendance.date,
    },
  });
}
