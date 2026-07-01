import { prisma } from '../config/database';
import { AppError } from '../types/errors';

export async function getStudentIdByUserId(userId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw AppError.notFound('Student');
  return student.id;
}

export default getStudentIdByUserId;
