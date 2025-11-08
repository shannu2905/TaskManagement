import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from '../controllers/notification.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread/count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/read/all', markAllAsRead);

export default router;

