import { Router } from 'express';
import { validate, schemas } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/authenticate.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import {
  createLeave,
  getStudentLeaves,
  getWardenLeaves,
  approveLeave,
  rejectLeave,
} from './leave.controller';
import { createLeaveSchema, rejectLeaveSchema } from './leave.validation';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission('leave:create'),
  validate(createLeaveSchema, 'body'),
  createLeave,
);

router.get(
  '/student',
  authenticate,
  requirePermission('leave:read'),
  getStudentLeaves,
);

router.get(
  '/warden',
  authenticate,
  requirePermission('leave:approve'),
  getWardenLeaves,
);

router.patch(
  '/:id/approve',
  authenticate,
  requirePermission('leave:approve'),
  validate(schemas.idParam, 'params'),
  approveLeave,
);

router.patch(
  '/:id/reject',
  authenticate,
  requirePermission('leave:reject'),
  validate(schemas.idParam, 'params'),
  validate(rejectLeaveSchema, 'body'),
  rejectLeave,
);

export default router;
