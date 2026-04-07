import { Request, Response } from 'express';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// ─── Helpers ────────────────────────────────────────────────

function formatUserProfile(row: any, computed: { eventsAttended: number; eventsWantToGo: number; friendCount: number }) {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    eventsAttended: computed.eventsAttended,
    eventsWantToGo: computed.eventsWantToGo,
    friendCount: computed.friendCount,
  };
}

function formatPublicProfile(row: any, computed: { eventsAttended: number; eventsWantToGo: number; friendCount: number }) {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    role: row.role,
    createdAt: row.created_at,
    eventsAttended: computed.eventsAttended,
    eventsWantToGo: computed.eventsWantToGo,
    friendCount: computed.friendCount,
  };
}

async function getComputedFields(userId: string) {
  const [attendedResult, wantToGoResult, friendResult] = await Promise.all([
    db('event_interactions')
      .where('user_id', userId)
      .where('type', 'attending')
      .count('* as count')
      .first(),
    db('event_interactions')
      .where('user_id', userId)
      .where('type', 'want_to_go')
      .count('* as count')
      .first(),
    db('friendships')
      .where(function () {
        this.where('user_id', userId).orWhere('friend_id', userId);
      })
      .where('status', 'accepted')
      .count('* as count')
      .first(),
  ]);

  return {
    eventsAttended: Number((attendedResult as any)?.count || 0),
    eventsWantToGo: Number((wantToGoResult as any)?.count || 0),
    friendCount: Number((friendResult as any)?.count || 0),
  };
}

// ─── Controllers ────────────────────────────────────────────

/**
 * GET /users/me — get my profile
 */
export async function getMyProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const user = await db('users').where('id', userId).first();
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const computed = await getComputedFields(userId);

  res.json({
    success: true,
    data: formatUserProfile(user, computed),
  });
}

/**
 * PATCH /users/me — update profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { displayName, avatarUrl, bio } = req.body;

  const updates: Record<string, any> = { updated_at: new Date() };
  if (displayName !== undefined) updates.display_name = displayName;
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
  if (bio !== undefined) updates.bio = bio;

  await db('users').where('id', userId).update(updates);

  const user = await db('users').where('id', userId).first();
  const computed = await getComputedFields(userId);

  logger.info({ userId }, 'Profile updated');

  res.json({
    success: true,
    data: formatUserProfile(user, computed),
  });
}

/**
 * GET /users/:userId — get public profile
 */
export async function getUserProfile(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;

  const user = await db('users').where('id', userId).first();
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const computed = await getComputedFields(userId);

  res.json({
    success: true,
    data: formatPublicProfile(user, computed),
  });
}

/**
 * GET /users/me/events — my events by interaction type
 */
export async function getMyEvents(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { type, page, pageSize } = req.query as any;
  const pageNum = Number(page) || 1;
  const pageSizeNum = Number(pageSize) || 20;
  const offset = (pageNum - 1) * pageSizeNum;

  const baseQuery = db('event_interactions as ei')
    .join('events as e', 'e.id', 'ei.event_id')
    .where('ei.user_id', userId)
    .where('ei.type', type);

  const countQuery = baseQuery.clone().count('* as total').first();

  const eventsQuery = baseQuery.clone()
    .select(
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
    )
    .orderBy('ei.created_at', 'desc')
    .offset(offset)
    .limit(pageSizeNum);

  const [totalResult, events] = await Promise.all([countQuery, eventsQuery]);
  const total = Number((totalResult as any)?.total || 0);

  const items = events.map((e: any) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    venueName: e.venue_name,
    coverImageUrl: e.cover_image_url,
    startTime: e.start_time,
    endTime: e.end_time,
    isFree: e.is_free,
    priceRange: e.price_min != null
      ? { min: e.price_min, max: e.price_max, currency: e.currency || 'TWD' }
      : undefined,
    attendingCount: e.attending_count,
    interestedCount: e.interested_count,
    latitude: e.latitude,
    longitude: e.longitude,
    isPromoted: e.is_promoted,
    friendsGoing: [],
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
