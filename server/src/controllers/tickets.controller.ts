import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// ─── Helpers ────────────────────────────────────────────────

const EVENT_SUMMARY_COLUMNS = [
  'e.id',
  'e.title',
  'e.category',
  'e.venue_name',
  'e.cover_image_url',
  'e.start_time',
  'e.end_time',
  'e.is_free',
  'e.price_min',
  'e.price_max',
  'e.currency',
  'e.attending_count',
  'e.interested_count',
  'e.latitude',
  'e.longitude',
  'e.is_promoted',
];

function formatEventSummary(row: any): any {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    venueName: row.venue_name,
    coverImageUrl: row.cover_image_url,
    startTime: row.start_time,
    endTime: row.end_time,
    isFree: row.is_free,
    priceRange: row.price_min != null
      ? { min: row.price_min, max: row.price_max, currency: row.currency || 'TWD' }
      : undefined,
    attendingCount: row.attending_count,
    interestedCount: row.interested_count,
    latitude: row.latitude,
    longitude: row.longitude,
    isPromoted: row.is_promoted,
    friendsGoing: [],
  };
}

function formatTicket(row: any): any {
  return {
    id: row.id,
    ticketTypeId: row.ticket_type_id,
    eventId: row.event_id,
    userId: row.user_id,
    orderId: row.order_id,
    qrCode: row.qr_code,
    status: row.status,
    purchasedAt: row.purchased_at,
    usedAt: row.used_at,
  };
}

function formatOrder(row: any): any {
  return {
    id: row.id,
    userId: row.user_id,
    eventId: row.event_id,
    totalAmount: row.total_amount,
    currency: row.currency,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  };
}

// ─── Controllers ────────────────────────────────────────────

/**
 * POST /orders — Create order with tickets
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { eventId, items, paymentMethod, couponCode } = req.body;

  // Verify event exists
  const event = await db('events').where('id', eventId).where('status', 'published').first();
  if (!event) {
    throw new AppError(404, 'NOT_FOUND', 'Event not found');
  }

  // Fetch ticket types
  const ticketTypeIds = items.map((i: any) => i.ticketTypeId);
  const ticketTypes = await db('ticket_types')
    .where('event_id', eventId)
    .whereIn('id', ticketTypeIds);

  if (ticketTypes.length !== ticketTypeIds.length) {
    throw new AppError(404, 'NOT_FOUND', 'One or more ticket types not found');
  }

  const ticketTypeMap = new Map(ticketTypes.map((tt: any) => [tt.id, tt]));

  // Validate availability and limits
  let subtotal = 0;
  for (const item of items) {
    const tt = ticketTypeMap.get(item.ticketTypeId)!;
    const remaining = tt.quantity - tt.sold_count;
    if (item.quantity > remaining) {
      throw new AppError(400, 'TICKETS_SOLD_OUT', `Not enough tickets for ${tt.name}`);
    }
    if (tt.max_per_user > 0) {
      // Check how many the user already has for this ticket type
      const existingCount = await db('tickets')
        .where('user_id', userId)
        .where('ticket_type_id', tt.id)
        .whereIn('status', ['valid', 'used'])
        .count('* as count')
        .first();
      const currentCount = Number((existingCount as any)?.count || 0);
      if (currentCount + item.quantity > tt.max_per_user) {
        throw new AppError(400, 'MAX_PER_USER_EXCEEDED', `Exceeds max per user for ${tt.name}`);
      }
    }
    // Check sale window
    const now = new Date();
    if (new Date(tt.sale_start) > now || new Date(tt.sale_end) < now) {
      throw new AppError(400, 'TICKETS_SOLD_OUT', `Sales not open for ${tt.name}`);
    }
    subtotal += tt.price * item.quantity;
  }

  // Apply coupon if provided
  let discountAmount = 0;
  let coupon: any = null;
  if (couponCode) {
    coupon = await db('coupons')
      .where('code', couponCode)
      .where('is_active', true)
      .where('valid_from', '<=', new Date())
      .where('valid_until', '>=', new Date())
      .first();

    if (!coupon) {
      throw new AppError(400, 'INVALID_COUPON', 'Invalid or expired coupon code');
    }
    if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      throw new AppError(400, 'INVALID_COUPON', 'Coupon has reached maximum uses');
    }
    if (coupon.event_id && coupon.event_id !== eventId) {
      throw new AppError(400, 'INVALID_COUPON', 'Coupon is not applicable to this event');
    }

    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round(subtotal * coupon.discount_value / 100);
    } else {
      discountAmount = Math.min(coupon.discount_value, subtotal);
    }
  }

  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
  // Apply 5% platform commission
  const platformFee = Math.round(totalAfterDiscount * 0.05);
  const totalAmount = totalAfterDiscount + platformFee;

  // Create order + tickets in transaction
  const orderId = uuidv4();
  const now = new Date();
  const tickets: any[] = [];

  await db.transaction(async (trx) => {
    // Create order
    await trx('orders').insert({
      id: orderId,
      user_id: userId,
      event_id: eventId,
      total_amount: totalAmount,
      currency: ticketTypes[0].currency || 'TWD',
      payment_method: paymentMethod,
      payment_status: 'paid',
      created_at: now,
    });

    // Create order items and tickets
    for (const item of items) {
      const tt = ticketTypeMap.get(item.ticketTypeId)!;

      await trx('order_items').insert({
        id: uuidv4(),
        order_id: orderId,
        ticket_type_id: tt.id,
        ticket_type_name: tt.name,
        quantity: item.quantity,
        unit_price: tt.price,
      });

      // Create individual tickets
      for (let i = 0; i < item.quantity; i++) {
        const ticketId = uuidv4();
        const qrCode = jwt.sign(
          { ticketId, userId },
          config.jwtSecret,
          { expiresIn: '30s' },
        );

        const ticket = {
          id: ticketId,
          ticket_type_id: tt.id,
          event_id: eventId,
          user_id: userId,
          order_id: orderId,
          qr_code: qrCode,
          status: 'valid',
          purchased_at: now,
        };
        await trx('tickets').insert(ticket);
        tickets.push(ticket);
      }

      // Update sold count
      await trx('ticket_types')
        .where('id', tt.id)
        .increment('sold_count', item.quantity);
    }

    // Consume coupon
    if (coupon) {
      await trx('coupons')
        .where('id', coupon.id)
        .increment('used_count', 1);
    }
  });

  // Fetch order items
  const orderItems = await db('order_items').where('order_id', orderId);

  const orderResponse = {
    id: orderId,
    userId,
    eventId,
    items: orderItems.map((oi: any) => ({
      ticketTypeId: oi.ticket_type_id,
      ticketTypeName: oi.ticket_type_name,
      quantity: oi.quantity,
      unitPrice: oi.unit_price,
    })),
    totalAmount,
    currency: ticketTypes[0].currency || 'TWD',
    paymentMethod,
    paymentStatus: 'paid',
    createdAt: now,
    tickets: tickets.map(formatTicket),
  };

  res.status(201).json({ success: true, data: orderResponse });
}

/**
 * GET /orders — List my orders (paginated)
 */
export async function listOrders(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const pageNum = Number(req.query.page) || 1;
  const pageSizeNum = Number(req.query.pageSize) || 20;
  const offset = (pageNum - 1) * pageSizeNum;

  const baseQuery = db('orders as o')
    .where('o.user_id', userId);

  const countQuery = baseQuery.clone().count('* as total').first();

  const ordersQuery = baseQuery.clone()
    .join('events as e', 'e.id', 'o.event_id')
    .select(
      'o.id',
      'o.user_id',
      'o.event_id',
      'o.total_amount',
      'o.currency',
      'o.payment_method',
      'o.payment_status',
      'o.created_at',
      'e.title as event_title',
      'e.cover_image_url as event_cover_image_url',
      'e.start_time as event_start_time',
    )
    .orderBy('o.created_at', 'desc')
    .offset(offset)
    .limit(pageSizeNum);

  const [totalResult, orders] = await Promise.all([countQuery, ordersQuery]);
  const total = Number((totalResult as any)?.total || 0);

  // Fetch order items for all orders
  const orderIds = orders.map((o: any) => o.id);
  const allItems = orderIds.length > 0
    ? await db('order_items').whereIn('order_id', orderIds)
    : [];

  const itemsByOrder: Record<string, any[]> = {};
  for (const item of allItems) {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
    itemsByOrder[item.order_id].push({
      ticketTypeId: item.ticket_type_id,
      ticketTypeName: item.ticket_type_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    });
  }

  const items = orders.map((o: any) => ({
    ...formatOrder(o),
    items: itemsByOrder[o.id] || [],
  }));

  res.json({
    success: true,
    data: {
      items,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      hasMore: offset + pageSizeNum < total,
    },
  });
}

/**
 * GET /orders/:orderId — Get order detail
 */
export async function getOrder(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { orderId } = req.params;

  const order = await db('orders').where('id', orderId).first();
  if (!order) {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
  }
  if (order.user_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Not your order');
  }

  const [orderItems, tickets] = await Promise.all([
    db('order_items').where('order_id', orderId),
    db('tickets').where('order_id', orderId),
  ]);

  res.json({
    success: true,
    data: {
      ...formatOrder(order),
      items: orderItems.map((oi: any) => ({
        ticketTypeId: oi.ticket_type_id,
        ticketTypeName: oi.ticket_type_name,
        quantity: oi.quantity,
        unitPrice: oi.unit_price,
      })),
      tickets: tickets.map(formatTicket),
    },
  });
}

/**
 * GET /tickets — List my tickets (paginated)
 */
export async function listTickets(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { status, page, pageSize } = req.query as any;
  const pageNum = Number(page) || 1;
  const pageSizeNum = Number(pageSize) || 20;
  const offset = (pageNum - 1) * pageSizeNum;

  const baseQuery = db('tickets as t')
    .where('t.user_id', userId);

  if (status) {
    baseQuery.where('t.status', status);
  }

  const countQuery = baseQuery.clone().count('* as total').first();

  const ticketsQuery = baseQuery.clone()
    .join('events as e', 'e.id', 't.event_id')
    .select(
      't.*',
      ...EVENT_SUMMARY_COLUMNS,
    )
    .orderBy('t.purchased_at', 'desc')
    .offset(offset)
    .limit(pageSizeNum);

  const [totalResult, tickets] = await Promise.all([countQuery, ticketsQuery]);
  const total = Number((totalResult as any)?.total || 0);

  const items = tickets.map((row: any) => ({
    ...formatTicket(row),
    event: formatEventSummary(row),
  }));

  res.json({
    success: true,
    data: {
      items,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      hasMore: offset + pageSizeNum < total,
    },
  });
}

/**
 * GET /tickets/:ticketId — Get ticket detail
 */
export async function getTicket(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { ticketId } = req.params;

  const ticket = await db('tickets as t')
    .join('events as e', 'e.id', 't.event_id')
    .where('t.id', ticketId)
    .select('t.*', ...EVENT_SUMMARY_COLUMNS)
    .first();

  if (!ticket) {
    throw new AppError(404, 'TICKET_NOT_FOUND', 'Ticket not found');
  }
  if (ticket.user_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Not your ticket');
  }

  res.json({
    success: true,
    data: {
      ...formatTicket(ticket),
      event: formatEventSummary(ticket),
    },
  });
}

/**
 * GET /tickets/:ticketId/qr — Generate dynamic QR code (30s expiry)
 */
export async function getQR(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { ticketId } = req.params;

  const ticket = await db('tickets').where('id', ticketId).first();
  if (!ticket) {
    throw new AppError(404, 'TICKET_NOT_FOUND', 'Ticket not found');
  }
  if (ticket.user_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Not your ticket');
  }

  const expiresAt = new Date(Date.now() + 30 * 1000);
  const qrPayload = jwt.sign(
    { ticketId: ticket.id, userId: ticket.user_id, ts: Date.now() },
    config.jwtSecret,
    { expiresIn: '30s' },
  );

  res.json({
    success: true,
    data: {
      qrPayload,
      expiresAt: expiresAt.toISOString(),
    },
  });
}

/**
 * POST /tickets/validate — Validate QR code (merchant role)
 */
export async function validateQR(req: Request, res: Response): Promise<void> {
  const merchantUser = req.user!;

  // Check merchant role
  if (merchantUser.role !== 'merchant' && merchantUser.role !== 'admin') {
    throw new AppError(403, 'FORBIDDEN', 'Merchant role required');
  }

  const { qrPayload } = req.body;

  // Verify JWT
  let payload: { ticketId: string; userId: string; ts: number };
  try {
    payload = jwt.verify(qrPayload, config.jwtSecret) as any;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError(400, 'QR_EXPIRED', 'QR code has expired');
    }
    throw new AppError(400, 'QR_EXPIRED', 'Invalid QR code');
  }

  // Fetch ticket
  const ticket = await db('tickets').where('id', payload.ticketId).first();
  if (!ticket) {
    throw new AppError(404, 'TICKET_NOT_FOUND', 'Ticket not found');
  }

  // Check ticket status
  if (ticket.status === 'used') {
    // Return ticket details with error
    const event = await db('events as e')
      .select(...EVENT_SUMMARY_COLUMNS)
      .where('e.id', ticket.event_id)
      .first();
    const user = await db('users').where('id', ticket.user_id).first();
    throw new AppError(400, 'TICKET_ALREADY_USED', 'Ticket already used');
  }

  if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
    throw new AppError(400, 'TICKET_INVALID_STATUS', `Ticket is ${ticket.status}`);
  }

  // Mark as used
  const now = new Date();
  await db('tickets').where('id', ticket.id).update({
    status: 'used',
    used_at: now,
  });

  // Fetch event and user info
  const event = await db('events as e')
    .select(...EVENT_SUMMARY_COLUMNS)
    .where('e.id', ticket.event_id)
    .first();
  const ticketUser = await db('users').where('id', ticket.user_id).first();

  res.json({
    success: true,
    data: {
      ticket: { ...formatTicket(ticket), status: 'used', usedAt: now },
      event: event ? formatEventSummary(event) : null,
      user: ticketUser ? {
        displayName: ticketUser.display_name,
        avatarUrl: ticketUser.avatar_url,
      } : null,
    },
  });
}
