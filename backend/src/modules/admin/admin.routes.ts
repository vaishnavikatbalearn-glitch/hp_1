import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import { requireSuperAdmin } from '../../middleware/rbac.middleware';
import { validate, schemas } from '../../middleware/validate.middleware';
import {
  activateAccount,
  createStaff,
  getStaff,
  listStaff,
  patchStaffStatus,
  updateStaff,
} from './admin.controller';
import {
  activateStaffSchema,
  createStaffSchema,
  updateStaffSchema,
  updateStaffStatusSchema,
} from './admin.validation';

const router = Router();

router.post('/create-staff', authenticate, requireSuperAdmin, validate(createStaffSchema, 'body'), createStaff);
router.post('/activate-account', validate(activateStaffSchema, 'body'), activateAccount);
router.get('/staff', authenticate, requireSuperAdmin, listStaff);
router.get('/staff/:id', authenticate, requireSuperAdmin, validate(schemas.idParam, 'params'), getStaff);
router.put('/staff/:id', authenticate, requireSuperAdmin, validate(schemas.idParam, 'params'), validate(updateStaffSchema, 'body'), updateStaff);
router.patch('/staff/:id/status', authenticate, requireSuperAdmin, validate(schemas.idParam, 'params'), validate(updateStaffStatusSchema, 'body'), patchStaffStatus);

export default router;
