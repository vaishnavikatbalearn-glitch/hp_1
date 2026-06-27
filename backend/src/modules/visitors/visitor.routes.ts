import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import { validate, schemas } from '../../middleware/validate.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { submitVisitor, myVisitors, pendingVisitors, approveVisitor, rejectVisitor } from './visitor.controller';
import { createVisitorSchema, rejectVisitorSchema } from './visitor.validation';

const router = Router();

router.post('/', authenticate, requirePermission('visitor:create'), validate(createVisitorSchema, 'body'), submitVisitor);
router.get('/student', authenticate, requirePermission('visitor:read'), myVisitors);
router.get('/my', authenticate, requirePermission('visitor:read'), myVisitors);
router.get('/warden', authenticate, requirePermission('visitor:approve'), pendingVisitors);
router.get('/pending', authenticate, requirePermission('visitor:approve'), pendingVisitors);
router.patch('/:id/approve', authenticate, requirePermission('visitor:approve'), validate(schemas.idParam, 'params'), approveVisitor);
router.patch('/:id/reject', authenticate, requirePermission('visitor:reject'), validate(schemas.idParam, 'params'), validate(rejectVisitorSchema, 'body'), rejectVisitor);

export default router;
