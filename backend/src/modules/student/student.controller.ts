import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../types/errors';
import {
  createStudent,
  getStudentById,
  listStudents,
  updateStudent,
  linkParentToStudent,
  updateStudentParentLink,
  unlinkParentFromStudent,
  getStudentParents,
  suspendStudent,
  activateStudent,
  deleteStudent,
  uploadStudentDocument,
} from './student.service';
import type {
  CreateStudentBody,
  UpdateStudentBody,
  StudentIdParams,
  StudentParentLinkBody,
  StudentParentUpdateBody,
  StudentIdWithParentIdParams,
  StudentDocumentUploadBody,
} from './student.validation';

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

export const getParents = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdParams;
  const parents = await getStudentParents(params.id);
  return ApiResponse.ok(res, parents);
});

export const linkParent = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdParams;
  const body = req.body as StudentParentLinkBody;
  const relation = await linkParentToStudent(params.id, body.parentId, body.isPrimary ?? false);
  return ApiResponse.ok(res, relation);
});

export const updateParentLink = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdParams;
  const body = req.body as StudentParentUpdateBody;
  const relation = await updateStudentParentLink(params.id, body.parentId, body.newParentId, body.isPrimary);
  return ApiResponse.ok(res, relation);
});

export const removeParentLink = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdWithParentIdParams;
  await unlinkParentFromStudent(params.id, params.parentId);
  return ApiResponse.ok(res, { success: true });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdParams;
  const body = req.body as UpdateStudentBody;
  const student = await updateStudent(params.id, body);
  return ApiResponse.ok(res, student);
});

export const suspend = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdParams;
  const student = await suspendStudent(params.id);
  return ApiResponse.ok(res, student);
});

export const activate = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdParams;
  const student = await activateStudent(params.id);
  return ApiResponse.ok(res, student);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdParams;
  const student = await deleteStudent(params.id);
  return ApiResponse.ok(res, student);
});

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as StudentIdParams;
  const body = req.body as StudentDocumentUploadBody;
  const file = req.file;

  if (!file) {
    throw AppError.badRequest('A file is required');
  }

  const student = await uploadStudentDocument(params.id, body.documentType, file);
  return ApiResponse.ok(res, student);
});
