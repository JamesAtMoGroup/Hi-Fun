import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema, listTicketsSchema, validateQRSchema } from '../validators/tickets.validator';
import {
  createOrder,
  listOrders,
  getOrder,
  listTickets,
  getTicket,
  getQR,
  validateQR,
} from '../controllers/tickets.controller';

const router = Router();

// POST /orders — create order
router.post('/orders', requireAuth, validate(createOrderSchema), createOrder);

// GET /orders — list my orders
router.get('/orders', requireAuth, listOrders);

// GET /orders/:orderId — get order detail
router.get('/orders/:orderId', requireAuth, getOrder);

// GET /tickets — list my tickets
router.get('/tickets', requireAuth, validate(listTicketsSchema), listTickets);

// GET /tickets/:ticketId — get ticket detail
router.get('/tickets/:ticketId', requireAuth, getTicket);

// GET /tickets/:ticketId/qr — get dynamic QR
router.get('/tickets/:ticketId/qr', requireAuth, getQR);

// POST /tickets/validate — validate QR (merchant role)
router.post('/tickets/validate', requireAuth, validate(validateQRSchema), validateQR);

export default router;
