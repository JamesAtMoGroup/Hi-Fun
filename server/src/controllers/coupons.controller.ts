import { Request, Response } from 'express';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /coupons/validate — validate coupon code
 */
export async function validateCoupon(req: Request, res: Response): Promise<void> {
  const { code, eventId } = req.body;

  const coupon = await db('coupons').where('code', code).first();

  if (!coupon) {
    throw new AppError(404, 'COUPON_NOT_FOUND', 'Coupon code not found');
  }

  if (!coupon.is_active) {
    throw new AppError(400, 'COUPON_INACTIVE', 'Coupon is no longer active');
  }

  const now = new Date();
  if (new Date(coupon.valid_from) > now) {
    throw new AppError(400, 'COUPON_NOT_YET_VALID', 'Coupon is not yet valid');
  }
  if (new Date(coupon.valid_until) < now) {
    throw new AppError(400, 'COUPON_EXPIRED', 'Coupon has expired');
  }

  if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
    throw new AppError(400, 'COUPON_MAXED', 'Coupon has reached maximum uses');
  }

  if (eventId && coupon.event_id && coupon.event_id !== eventId) {
    throw new AppError(400, 'COUPON_NOT_APPLICABLE', 'Coupon is not applicable to this event');
  }

  res.json({
    success: true,
    data: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      eventId: coupon.event_id,
      validUntil: coupon.valid_until,
    },
  });
}
