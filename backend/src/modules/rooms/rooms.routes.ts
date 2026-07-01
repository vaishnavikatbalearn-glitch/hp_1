import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { getFloors, getRooms } from './rooms.controller';

const router = Router();

router.get('/', authenticate, requirePermission('room:read'), getRooms);
router.get('/floors', authenticate, requirePermission('room:read'), getFloors);

export default router;
