import { z } from 'zod';

const coerceNumber = z.preprocess((val) => {
  if (typeof val === 'string' && val !== '') return Number(val);
  return val;
}, z.number().optional());

export const createOrderSchema = z.object({
  body: z.object({
    eventId: z.string().uuid('Invalid event ID'),
    items: z.array(z.object({
      ticketTypeId: z.string().uuid('Invalid ticket type ID'),
      quantity: z.number().int().positive().max(10),
    })).min(1, 'At least one item is required'),
    paymentMethod: z.enum(['credit_card', 'apple_pay', 'google_pay']),
    couponCode: z.string().optional(),
  }),
});

export const listTicketsSchema = z.object({
  query: z.object({
    status: z.enum(['valid', 'used', 'cancelled', 'refunded']).optional(),
    page: coerceNumber.pipe(z.number().int().positive().optional()).default(1),
    pageSize: coerceNumber.pipe(z.number().int().positive().max(100).optional()).default(20),
  }),
});

export const validateQRSchema = z.object({
  body: z.object({
    qrPayload: z.string().min(1, 'QR payload is required'),
  }),
});
