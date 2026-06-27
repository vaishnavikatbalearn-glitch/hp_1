import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { validate, schemas } from '../../middleware/validate.middleware';
import {
  editPayment,
  getPendingFees,
  getStudentFeeHistory,
  getStudentFees,
  recordPayment,
} from './fees.controller';
import { paymentCreateSchema, paymentUpdateSchema, studentFeeParamsSchema } from './fees.validation';

const router = Router();

router.get(
  '/student/:studentId',
  authenticate,
  requirePermission('fees:read'),
  validate(studentFeeParamsSchema, 'params'),
  getStudentFees,
);

router.get(
  '/history/:studentId',
  authenticate,
  requirePermission('fees:read'),
  validate(studentFeeParamsSchema, 'params'),
  getStudentFeeHistory,
);

router.get(
  '/pending',
  authenticate,
  requirePermission('fees:read'),
  getPendingFees,
);

router.post(
  '/payment',
  authenticate,
  requirePermission('fees:update'),
  validate(paymentCreateSchema, 'body'),
  recordPayment,
);

router.patch(
  '/payment/:id',
  authenticate,
  requirePermission('fees:update'),
  validate(schemas.idParam, 'params'),
  validate(paymentUpdateSchema, 'body'),
  editPayment,
);

export default router;
