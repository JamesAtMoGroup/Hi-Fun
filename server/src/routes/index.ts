import { Router } from 'express';
import authRouter from './auth';
import eventsRouter from './events';
import socialRouter from './social';
import datingRouter from './dating';
import ticketsRouter from './tickets';
import usersRouter from './users';
import notificationsRouter from './notifications';
import couponsRouter from './coupons';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Mount sub-routers
router.use(authRouter);
router.use(eventsRouter);
router.use(socialRouter);
router.use(datingRouter);
router.use(ticketsRouter);
router.use(usersRouter);
router.use(notificationsRouter);
router.use(couponsRouter);

export default router;
