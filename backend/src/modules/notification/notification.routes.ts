import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import {
  getNotifications,
  createNotification,
  readNotification,
} from './notification.controller';

const router = Router();

router.use(authenticate);
router.get('/', getNotifications);
router.post('/', createNotification);
router.patch('/:id/read', readNotification);

export default router;
