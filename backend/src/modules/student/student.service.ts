import { prisma } from '../../config/database';
import { AppError } from '../../types/errors';
import { Prisma } from '@prisma/client';
import { getUploadPublicUrl, persistUploadedFile } from '../../utils/upload';
import type { CreateStudentBody, UpdateStudentBody } from './student.validation';

export type StudentUploadFile = Express.Multer.File;

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
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

function buildEnrollmentBranchCode(branch: string) {
  const normalized = branch.trim().toUpperCase();
  const parts = normalized.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'XX';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).padEnd(2, 'X');
  }

  return (parts[0][0] + parts[1][0]).padEnd(2, 'X');
}

function buildEnrollmentPrefix(branch: string, admissionDate: Date) {
  const year = admissionDate.getFullYear();
  const branchCode = buildEnrollmentBranchCode(branch);
  return `HP${year}${branchCode}`;
}

async function generateUniqueEnrollmentNumber(branch: string, admissionDate: Date) {
  const prefix = buildEnrollmentPrefix(branch, admissionDate);

  const latestStudent = await prisma.student.findFirst({
    where: {
      enrollmentNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      enrollmentNumber: 'desc',
    },
    select: {
      enrollmentNumber: true,
    },
  });

  const lastSequence = latestStudent?.enrollmentNumber.slice(prefix.length) ?? '';
  const nextIndex = lastSequence && !Number.isNaN(Number(lastSequence)) ? Number(lastSequence) + 1 : 1;
  const formattedSequence = String(nextIndex).padStart(6, '0');
  return `${prefix}${formattedSequence}`;
}

export async function createStudent(data: CreateStudentBody) {
  if (data.enrollmentNumber) {
    const existing = await prisma.student.findUnique({ where: { enrollmentNumber: data.enrollmentNumber } });
    if (existing) throw AppError.conflict('Enrollment number already exists');
  }

  const admissionDate = new Date(data.admissionDate);
  let enrollmentNumber = data.enrollmentNumber?.trim();

  if (!enrollmentNumber) {
    enrollmentNumber = await generateUniqueEnrollmentNumber(data.branch, admissionDate);
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await prisma.student.create({
        data: {
          ...data,
          enrollmentNumber,
          gender: data.gender as 'MALE' | 'FEMALE' | 'OTHER',
          dateOfBirth: new Date(data.dateOfBirth),
          admissionDate,
          vacateDate: data.vacateDate ? new Date(data.vacateDate) : undefined,
        },
        select: STUDENT_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        attempt < 4
      ) {
        enrollmentNumber = await generateUniqueEnrollmentNumber(data.branch, admissionDate);
        continue;
      }

      throw error;
    }
  }

  throw AppError.conflict('Failed to generate a unique enrollment number');
}

export async function getStudentById(id: string) {
  const student = await prisma.student.findFirst({ where: { id, deletedAt: null }, select: STUDENT_SELECT });
  if (!student) throw AppError.notFound('Student');
  return student;
}

export async function listStudents() {
  return prisma.student.findMany({ where: { deletedAt: null }, select: STUDENT_SELECT, orderBy: { createdAt: 'desc' } });
}

export async function updateStudent(id: string, data: UpdateStudentBody) {
  const student = await prisma.student.findFirst({ where: { id, deletedAt: null } });
  if (!student) throw AppError.notFound('Student');

  if (data.enrollmentNumber) {
    const existing = await prisma.student.findUnique({ where: { enrollmentNumber: data.enrollmentNumber } });
    if (existing && existing.id !== id) throw AppError.conflict('Enrollment number already exists');
  }

  return prisma.student.update({
    where: { id },
    data: {
      ...data,
      gender: data.gender ? (data.gender as 'MALE' | 'FEMALE' | 'OTHER') : undefined,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined,
      vacateDate: data.vacateDate === undefined ? undefined : data.vacateDate ? new Date(data.vacateDate) : null,
      userId: data.userId ?? undefined,
      hostelId: data.hostelId ?? undefined,
    },
    select: STUDENT_SELECT,
  });
}

export async function linkParentToStudent(studentId: string, parentId: string, isPrimary = false) {
  const [student, parent] = await prisma.$transaction([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.parent.findUnique({ where: { id: parentId } }),
  ]);

  if (!student) throw AppError.notFound('Student');
  if (!parent) throw AppError.notFound('Parent');

  const existing = await prisma.studentParent.findUnique({
    where: { studentId_parentId: { studentId, parentId } },
  });

  if (existing) throw AppError.conflict('Parent is already linked to this student');

  if (isPrimary) {
    await prisma.studentParent.updateMany({ where: { studentId, isPrimary: true }, data: { isPrimary: false } });
  }

  return prisma.studentParent.create({
    data: { studentId, parentId, isPrimary },
    include: { parent: true },
  });
}

export async function updateStudentParentLink(
  studentId: string,
  parentId: string,
  newParentId?: string,
  isPrimary?: boolean,
) {
  const relation = await prisma.studentParent.findUnique({
    where: { studentId_parentId: { studentId, parentId } },
  });
  if (!relation) throw AppError.notFound('Parent link not found');

  const updateData: { parentId?: string; isPrimary?: boolean } = {};

  if (newParentId && newParentId !== parentId) {
    const newParent = await prisma.parent.findUnique({ where: { id: newParentId } });
    if (!newParent) throw AppError.notFound('Parent');

    const conflict = await prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId, parentId: newParentId } },
    });
    if (conflict) throw AppError.conflict('New parent is already linked to this student');

    updateData.parentId = newParentId;
  }

  if (typeof isPrimary === 'boolean') {
    updateData.isPrimary = isPrimary;
    if (isPrimary) {
      await prisma.studentParent.updateMany({ where: { studentId, isPrimary: true }, data: { isPrimary: false } });
    }
  }

  return prisma.studentParent.update({
    where: { id: relation.id },
    data: updateData,
    include: { parent: true },
  });
}

export async function unlinkParentFromStudent(studentId: string, parentId: string) {
  const relation = await prisma.studentParent.findUnique({
    where: { studentId_parentId: { studentId, parentId } },
  });
  if (!relation) throw AppError.notFound('Parent link not found');
  return prisma.studentParent.delete({ where: { id: relation.id } });
}

export async function getStudentParents(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      parents: {
        include: { parent: true },
      },
    },
  });

  if (!student) throw AppError.notFound('Student');

  return student.parents.map((relation) => ({
    id: relation.id,
    studentId: relation.studentId,
    parentId: relation.parentId,
    isPrimary: relation.isPrimary,
    parent: {
      id: relation.parent.id,
      userId: relation.parent.userId,
      firstName: relation.parent.firstName,
      lastName: relation.parent.lastName,
      phone: relation.parent.phone,
      alternatePhone: relation.parent.alternatePhone,
      email: relation.parent.email,
      relation: relation.parent.relation,
      address: relation.parent.address,
      photoUrl: relation.parent.photoUrl,
      isVerified: relation.parent.isVerified,
      createdAt: relation.parent.createdAt,
      updatedAt: relation.parent.updatedAt,
    },
  }));
}

export async function suspendStudent(id: string) {
  const student = await prisma.student.findFirst({ where: { id, deletedAt: null } });
  if (!student) throw AppError.notFound('Student');

  return prisma.student.update({
    where: { id },
    data: { isActive: false },
    select: STUDENT_SELECT,
  });
}

export async function activateStudent(id: string) {
  const student = await prisma.student.findFirst({ where: { id, deletedAt: null } });
  if (!student) throw AppError.notFound('Student');

  return prisma.student.update({
    where: { id },
    data: { isActive: true },
    select: STUDENT_SELECT,
  });
}

export async function deleteStudent(id: string) {
  const student = await prisma.student.findFirst({ where: { id, deletedAt: null } });
  if (!student) throw AppError.notFound('Student');

  return prisma.student.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: STUDENT_SELECT,
  });
}

export async function uploadStudentDocument(id: string, documentType: string, file: StudentUploadFile) {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw AppError.notFound('Student');

  const allowedDocumentTypes = new Set(['studentPhoto', 'parentPhoto', 'aadhaar', 'tenthMarksheet', 'twelfthMarksheet']);
  if (!allowedDocumentTypes.has(documentType)) {
    throw AppError.badRequest('Unsupported document type');
  }

  const destinationDir = `students/${id}`;
  const storedFilePath = persistUploadedFile(file, destinationDir, `${documentType}-${Date.now()}${Math.round(Math.random() * 1e9)}`);
  const publicUrl = getUploadPublicUrl(storedFilePath);

  const documentFieldMap: Record<string, string> = {
    studentPhoto: 'photoUrl',
    parentPhoto: 'photoUrl',
    aadhaar: 'photoUrl',
    tenthMarksheet: 'photoUrl',
    twelfthMarksheet: 'photoUrl',
  };

  const field = documentFieldMap[documentType];
  if (!field) {
    throw AppError.badRequest('Unsupported document type');
  }

  const updatedStudent = await prisma.student.update({
    where: { id },
    data: { [field]: publicUrl },
    select: STUDENT_SELECT,
  });

  return updatedStudent;
}
