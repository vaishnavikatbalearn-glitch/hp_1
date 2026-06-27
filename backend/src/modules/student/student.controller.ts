import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { createStudent, getStudentById, listStudents, updateStudent, deleteStudent } from './student.service';
import type { CreateStudentBody, UpdateStudentBody, StudentIdParams } from './student.validation';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateStudentBody;
  const student = await createStudent(body);
  return ApiResponse.created(res, student);
});

export const findAll = asyncHandler(async (_req: Request, res: Response) => {
  const students = await listStudents();
  return ApiResponse.ok(res, students);
});

export const findOne = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdParams;
  const student = await getStudentById(params.id);
  return ApiResponse.ok(res, student);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdParams;
  const body = req.body as UpdateStudentBody;
  const student = await updateStudent(params.id, body);
  return ApiResponse.ok(res, student);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdParams;
  const student = await deleteStudent(params.id);
  return ApiResponse.ok(res, student);
});
