import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import { validate, schemas } from '../../middleware/validate.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { submitLaundryRequest, listLaundryRequests, patchLaundryStatus } from './laundry.controller';
import { createLaundrySchema, updateLaundryStatusSchema } from './laundry.validation';

const router = Router();

router.post(
  '/',
  authenticate,
  requirePermission('laundry:create'),
  validate(createLaundrySchema, 'body'),
  submitLaundryRequest,
);

router.get(
  '/',
  authenticate,
  requirePermission('laundry:read'),
  listLaundryRequests,
);

router.patch(
  '/:id/status',
  authenticate,
  requirePermission('laundry:update'),
  validate(schemas.idParam, 'params'),
  validate(updateLaundryStatusSchema, 'body'),
  patchLaundryStatus,
);

export default router;
