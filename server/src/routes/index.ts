import { Router } from 'express';
import eventsRouter from './events';
import socialRouter from './social';
import datingRouter from './dating';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Mount sub-routers
router.use(eventsRouter);
router.use(socialRouter);
router.use(datingRouter);

export default router;
