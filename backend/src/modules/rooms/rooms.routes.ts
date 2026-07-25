import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { getFloors, getRooms, assignRoomToStudent, changeStudentRoom } from './rooms.controller';
import { assignRoomSchema, changeRoomSchema } from './rooms.validation';

const router = Router();

router.get('/', authenticate, requirePermission('room:read'), getRooms);
router.get('/floors', authenticate, requirePermission('room:read'), getFloors);
router.post('/allocate', authenticate, requirePermission('room:update'), validate(assignRoomSchema, 'body'), assignRoomToStudent);
router.patch('/allocate', authenticate, requirePermission('room:update'), validate(changeRoomSchema, 'body'), changeStudentRoom);

export default router;
