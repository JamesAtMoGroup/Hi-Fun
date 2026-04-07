import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listNotifications,
  markRead,
  markAllRead,
  registerPushToken,
  unregisterPushToken,
} from '../controllers/notifications.controller';

const router = Router();

// GET /notifications — list notifications
router.get('/notifications', requireAuth, listNotifications);

// PUT /notifications/read-all — mark all as read (must be before :notificationId)
router.put('/notifications/read-all', requireAuth, markAllRead);

// PUT /notifications/:notificationId/read — mark as read
router.put('/notifications/:notificationId/read', requireAuth, markRead);

// POST /notifications/push-tokens — register push token
router.post('/notifications/push-tokens', requireAuth, registerPushToken);

// DELETE /notifications/push-tokens — unregister push token
router.delete('/notifications/push-tokens', requireAuth, unregisterPushToken);

export default router;
