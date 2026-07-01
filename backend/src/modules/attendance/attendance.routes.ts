import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import { validate } from '../../middleware/validate.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import {
  markAttendance,
  getStudentAttendance,
  getTodayAttendance,
  getAttendanceSummary,
  updateAttendance,
} from './attendance.controller';
import {
  markAttendanceSchema,
  attendanceIdParam,
  attendanceSummaryQuery,
} from './attendance.validation';

const router = Router();

router.post(
  '/mark',
  authenticate,
  requirePermission('attendance:mark'),
  validate(markAttendanceSchema, 'body'),
  markAttendance,
);

router.get(
  '/student/:studentId',
  authenticate,
  requirePermission('attendance:read'),
  validate(attendanceIdParam, 'params'),
  getStudentAttendance,
);

router.get(
  '/today',
  authenticate,
  requirePermission('attendance:read'),
  getTodayAttendance,
);

router.get(
  '/summary',
  authenticate,
  requirePermission('attendance:report'),
  validate(attendanceSummaryQuery, 'query'),
  getAttendanceSummary,
);

router.patch(
  '/:id',
  authenticate,
  requirePermission('attendance:mark'),
  validate(attendanceIdParam, 'params'),
  validate(markAttendanceSchema, 'body'),
  updateAttendance,
);

export default router;
