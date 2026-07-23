import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import { requireSuperAdmin } from '../../middleware/rbac.middleware';
import { validate, schemas } from '../../middleware/validate.middleware';
import {
  activateAccount,
  createStaff,
  disableStaff,
  enableStaff,
  getStaff,
  listStaff,
  patchStaffStatus,
  resetStaffPasswordHandler,
  sendStaffOtpHandler,
  updateStaff,
} from './admin.controller';
import {
  activateStaffSchema,
  createStaffSchema,
  resetStaffPasswordSchema,
  updateStaffSchema,
  updateStaffStatusSchema,
} from './admin.validation';

const router = Router();

router.post('/staff', authenticate, requireSuperAdmin, validate(createStaffSchema, 'body'), createStaff);
router.post('/create-staff', authenticate, requireSuperAdmin, validate(createStaffSchema, 'body'), createStaff);
router.post('/activate-account', validate(activateStaffSchema, 'body'), activateAccount);
router.get('/staff', authenticate, requireSuperAdmin, listStaff);
router.get('/staff/:id', authenticate, requireSuperAdmin, validate(schemas.idParam, 'params'), getStaff);
router.patch('/staff/:id', authenticate, requireSuperAdmin, validate(schemas.idParam, 'params'), validate(updateStaffSchema, 'body'), updateStaff);
router.put('/staff/:id', authenticate, requireSuperAdmin, validate(schemas.idParam, 'params'), validate(updateStaffSchema, 'body'), updateStaff);
router.patch('/staff/:id/disable', authenticate, requireSuperAdmin, validate(schemas.idParam, 'params'), disableStaff);
router.patch('/staff/:id/enable', authenticate, requireSuperAdmin, validate(schemas.idParam, 'params'), enableStaff);
router.post('/staff/:id/send-otp', authenticate, requireSuperAdmin, validate(schemas.idParam, 'params'), sendStaffOtpHandler);
router.post('/staff/:id/reset-password', authenticate, requireSuperAdmin, validate(schemas.idParam, 'params'), validate(resetStaffPasswordSchema, 'body'), resetStaffPasswordHandler);
router.patch('/staff/:id/status', authenticate, requireSuperAdmin, validate(schemas.idParam, 'params'), validate(updateStaffStatusSchema, 'body'), patchStaffStatus);

export default router;
