import { prisma } from '../../config/database';
import { AppError } from '../../types/errors';
import type { CreateStudentBody, UpdateStudentBody } from './student.validation';

const STUDENT_SELECT = {
  id: true,
  userId: true,
  hostelId: true,
  enrollmentNumber: true,
  firstName: true,
  lastName: true,
  gender: true,
  dateOfBirth: true,
  phone: true,
  emergencyPhone: true,
  bloodGroup: true,
  photoUrl: true,
  address: true,
  city: true,
  state: true,
  pinCode: true,
  course: true,
  year: true,
  branch: true,
  college: true,
  isActive: true,
  admissionDate: true,
  vacateDate: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function createStudent(data: CreateStudentBody) {
  const existing = await prisma.student.findUnique({ where: { enrollmentNumber: data.enrollmentNumber } });
  if (existing) throw AppError.conflict('Enrollment number already exists');

  return prisma.student.create({
    data: {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
      admissionDate: new Date(data.admissionDate),
      vacateDate: data.vacateDate ? new Date(data.vacateDate) : undefined,
    },
    select: STUDENT_SELECT,
  });
}

export async function getStudentById(id: string) {
  const student = await prisma.student.findUnique({ where: { id }, select: STUDENT_SELECT });
  if (!student) throw AppError.notFound('Student');
  return student;
}

export async function listStudents() {
  return prisma.student.findMany({ select: STUDENT_SELECT, orderBy: { createdAt: 'desc' } });
}

export async function updateStudent(id: string, data: UpdateStudentBody) {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw AppError.notFound('Student');

  if (data.enrollmentNumber) {
    const existing = await prisma.student.findUnique({ where: { enrollmentNumber: data.enrollmentNumber } });
    if (existing && existing.id !== id) throw AppError.conflict('Enrollment number already exists');
  }

  return prisma.student.update({
    where: { id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined,
      vacateDate: data.vacateDate === undefined ? undefined : data.vacateDate ? new Date(data.vacateDate) : null,
    },
    select: STUDENT_SELECT,
  });
}

export async function deleteStudent(id: string) {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw AppError.notFound('Student');
  return prisma.student.delete({ where: { id }, select: STUDENT_SELECT });
}
