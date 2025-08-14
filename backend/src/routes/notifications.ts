import { Router } from 'express';
import { authenticateToken, requireAnyUser } from '../middleware/auth';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../controllers/notificationController';

const router = Router();

router.use(authenticateToken);
router.use(requireAnyUser);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);

export default router;
