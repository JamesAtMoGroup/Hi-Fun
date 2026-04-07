import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// ─── Helpers ────────────────────────────────────────────────

function formatNotification(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    data: row.data || undefined,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

// ─── Controllers ────────────────────────────────────────────

/**
 * GET /notifications — list notifications
 */
export async function listNotifications(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const pageNum = Number(req.query.page) || 1;
  const pageSizeNum = Number(req.query.pageSize) || 20;
  const offset = (pageNum - 1) * pageSizeNum;

  const baseQuery = db('notifications')
    .where('user_id', userId);

  const countQuery = baseQuery.clone().count('* as total').first();

  const notificationsQuery = baseQuery.clone()
    .orderBy('created_at', 'desc')
    .offset(offset)
    .limit(pageSizeNum);

  const [totalResult, notifications] = await Promise.all([countQuery, notificationsQuery]);
  const total = Number((totalResult as any)?.total || 0);

  const items = notifications.map(formatNotification);

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
 * PUT /notifications/:notificationId/read — mark as read
 */
export async function markRead(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { notificationId } = req.params;

  const notification = await db('notifications')
    .where('id', notificationId)
    .where('user_id', userId)
    .first();

  if (!notification) {
    throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
  }

  await db('notifications')
    .where('id', notificationId)
    .update({ is_read: true });

  res.json({
    success: true,
    data: { ...formatNotification(notification), isRead: true },
  });
}

/**
 * PUT /notifications/read-all — mark all as read
 */
export async function markAllRead(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const updated = await db('notifications')
    .where('user_id', userId)
    .where('is_read', false)
    .update({ is_read: true });

  logger.info({ userId, count: updated }, 'Marked all notifications read');

  res.json({
    success: true,
    data: { updatedCount: updated },
  });
}

/**
 * POST /notifications/push-tokens — register push token
 */
export async function registerPushToken(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { token, platform } = req.body;

  // Upsert: if token exists for this user, update it; otherwise insert
  const existing = await db('push_tokens')
    .where('user_id', userId)
    .where('token', token)
    .first();

  if (existing) {
    await db('push_tokens')
      .where('id', existing.id)
      .update({ platform, updated_at: new Date() });
  } else {
    await db('push_tokens').insert({
      id: uuidv4(),
      user_id: userId,
      token,
      platform: platform || 'expo',
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  logger.info({ userId }, 'Push token registered');

  res.status(201).json({
    success: true,
    data: { token, platform: platform || 'expo' },
  });
}

/**
 * DELETE /notifications/push-tokens — unregister push token
 */
export async function unregisterPushToken(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { token } = req.body;

  const deleted = await db('push_tokens')
    .where('user_id', userId)
    .where('token', token)
    .delete();

  if (!deleted) {
    throw new AppError(404, 'TOKEN_NOT_FOUND', 'Push token not found');
  }

  logger.info({ userId }, 'Push token unregistered');

  res.json({
    success: true,
    data: null,
  });
}
