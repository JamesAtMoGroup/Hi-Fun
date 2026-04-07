import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateCoupon } from '../controllers/coupons.controller';

const router = Router();

// POST /coupons/validate — validate coupon code
router.post('/coupons/validate', requireAuth, validateCoupon);

export default router;
