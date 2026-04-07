import { Request, Response } from 'express';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// ─── List Friends ───────────────────────────────────────────
export async function listFriends(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { search, page = 1, pageSize = 20 } = req.query as {
    search?: string;
    page?: number;
    pageSize?: number;
  };

  const offset = (Number(page) - 1) * Number(pageSize);

  let query = db('friendships as f')
    .join('users as u', function () {
      this.on(db.raw('CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END', [userId]))
        .onVal('u.id', db.raw('??', ['u.id']));
    })
    .where('f.status', 'accepted')
    .andWhere(function () {
      this.where('f.user_id', userId).orWhere('f.friend_id', userId);
    });

  // Rewrite the join more simply using raw
  query = db.raw(`
    SELECT u.id, u.display_name, u.email, u.avatar_url, u.bio, u.role, u.created_at, u.updated_at,
           COUNT(*) OVER() AS total_count
    FROM friendships f
    JOIN users u ON u.id = CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END
    WHERE f.status = 'accepted'
      AND (f.user_id = ? OR f.friend_id = ?)
      ${search ? 'AND u.display_name ILIKE ?' : ''}
    ORDER BY u.display_name ASC
    LIMIT ? OFFSET ?
  `, search
    ? [userId, userId, userId, `%${search}%`, Number(pageSize), offset]
    : [userId, userId, userId, Number(pageSize), offset],
  );

  const result = await query;
  const rows = result.rows || result;
  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

  const items = rows.map((row: any) => ({
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  res.json({
    success: true,
    data: {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      hasMore: offset + items.length < total,
    },
  });
}

// ─── Send Friend Request ────────────────────────────────────
export async function sendFriendRequest(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { userId: friendId } = req.body;

  if (userId === friendId) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Cannot send friend request to yourself');
  }

  // Check target user exists
  const targetUser = await db('users').where('id', friendId).first();
  if (!targetUser) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Target user not found');
  }

  // Check for existing friendship/request in both directions
  const existing = await db('friendships')
    .where(function () {
      this.where({ user_id: userId, friend_id: friendId })
        .orWhere({ user_id: friendId, friend_id: userId });
    })
    .first();

  if (existing) {
    throw new AppError(409, 'FRIEND_REQUEST_EXISTS', 'Friend request already exists or users are already friends');
  }

  const [friendship] = await db('friendships')
    .insert({
      user_id: userId,
      friend_id: friendId,
      status: 'pending',
    })
    .returning('*');

  res.status(201).json({
    success: true,
    data: {
      id: friendship.id,
      userId: friendship.user_id,
      friendId: friendship.friend_id,
      status: friendship.status,
      createdAt: friendship.created_at,
    },
  });
}

// ─── List Pending Requests ──────────────────────────────────
export async function listPendingRequests(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { direction = 'incoming', page = 1, pageSize = 20 } = req.query as {
    direction?: string;
    page?: number;
    pageSize?: number;
  };

  const offset = (Number(page) - 1) * Number(pageSize);
  const isIncoming = direction === 'incoming';

  // For incoming: current user is friend_id, show the sender (user_id)
  // For outgoing: current user is user_id, show the recipient (friend_id)
  const myColumn = isIncoming ? 'f.friend_id' : 'f.user_id';
  const otherColumn = isIncoming ? 'f.user_id' : 'f.friend_id';

  const result = await db.raw(`
    SELECT f.id, f.user_id, f.friend_id, f.status, f.created_at,
           u.id AS other_id, u.display_name, u.avatar_url, u.bio,
           COUNT(*) OVER() AS total_count
    FROM friendships f
    JOIN users u ON u.id = ${otherColumn}
    WHERE ${myColumn} = ?
      AND f.status = 'pending'
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, Number(pageSize), offset]);

  const rows = result.rows || result;
  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

  const items = rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    friendId: row.friend_id,
    status: row.status,
    createdAt: row.created_at,
    user: {
      id: row.other_id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
    },
  }));

  res.json({
    success: true,
    data: {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      hasMore: offset + items.length < total,
    },
  });
}

// ─── Accept Friend Request ──────────────────────────────────
export async function acceptFriendRequest(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { requestId } = req.params;

  const request = await db('friendships').where('id', requestId).first();
  if (!request) {
    throw new AppError(404, 'REQUEST_NOT_FOUND', 'Friend request not found');
  }

  // Only the recipient (friend_id) can accept
  if (request.friend_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Only the recipient can accept a friend request');
  }

  if (request.status !== 'pending') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request is no longer pending');
  }

  const [updated] = await db('friendships')
    .where('id', requestId)
    .update({ status: 'accepted', updated_at: db.fn.now() })
    .returning('*');

  res.json({
    success: true,
    data: {
      id: updated.id,
      userId: updated.user_id,
      friendId: updated.friend_id,
      status: updated.status,
      createdAt: updated.created_at,
    },
  });
}

// ─── Reject Friend Request ──────────────────────────────────
export async function rejectFriendRequest(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { requestId } = req.params;

  const request = await db('friendships').where('id', requestId).first();
  if (!request) {
    throw new AppError(404, 'REQUEST_NOT_FOUND', 'Friend request not found');
  }

  // Only the recipient (friend_id) can reject
  if (request.friend_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Only the recipient can reject a friend request');
  }

  await db('friendships').where('id', requestId).delete();

  res.json({ success: true, data: null });
}

// ─── Remove Friend ──────────────────────────────────────────
export async function removeFriend(req: Request, res: Response): Promise<void> {
  const currentUserId = req.user!.id;
  const { userId: friendId } = req.params;

  const deleted = await db('friendships')
    .where(function () {
      this.where({ user_id: currentUserId, friend_id: friendId })
        .orWhere({ user_id: friendId, friend_id: currentUserId });
    })
    .andWhere('status', 'accepted')
    .delete();

  if (!deleted) {
    throw new AppError(404, 'FRIENDSHIP_NOT_FOUND', 'Friendship not found');
  }

  res.json({ success: true, data: null });
}

// ─── Friend Activity Feed ───────────────────────────────────
export async function friendActivity(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { page = 1, pageSize = 20 } = req.query as { page?: number; pageSize?: number };
  const offset = (Number(page) - 1) * Number(pageSize);

  const result = await db.raw(`
    SELECT
      ei.id,
      ei.type,
      ei.created_at,
      u.id AS user_id,
      u.display_name,
      u.avatar_url,
      e.id AS event_id,
      e.title,
      e.category,
      e.venue_name,
      e.cover_image_url,
      e.start_time,
      e.end_time,
      e.is_free,
      e.attending_count,
      e.interested_count,
      e.latitude,
      e.longitude,
      e.is_promoted,
      COUNT(*) OVER() AS total_count
    FROM event_interactions ei
    JOIN users u ON u.id = ei.user_id
    JOIN events e ON e.id = ei.event_id
    JOIN friendships f ON (
      (f.user_id = ? AND f.friend_id = ei.user_id)
      OR (f.friend_id = ? AND f.user_id = ei.user_id)
    )
    WHERE f.status = 'accepted'
      AND ei.user_id != ?
    ORDER BY ei.created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, userId, userId, Number(pageSize), offset]);

  const rows = result.rows || result;
  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

  const items = rows.map((row: any) => ({
    id: row.id,
    user: {
      id: row.user_id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
    },
    type: row.type,
    event: {
      id: row.event_id,
      title: row.title,
      category: row.category,
      venueName: row.venue_name,
      coverImageUrl: row.cover_image_url,
      startTime: row.start_time,
      endTime: row.end_time,
      isFree: row.is_free,
      attendingCount: row.attending_count,
      interestedCount: row.interested_count,
      latitude: row.latitude,
      longitude: row.longitude,
      isPromoted: row.is_promoted,
      friendsGoing: [],
    },
    createdAt: row.created_at,
  }));

  res.json({
    success: true,
    data: {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      hasMore: offset + items.length < total,
    },
  });
}
