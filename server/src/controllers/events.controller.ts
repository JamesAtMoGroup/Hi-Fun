import { Request, Response } from 'express';
import { db } from '../config/database';
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
    distance: row.distance != null ? Math.round(row.distance / 10) / 100 : undefined, // meters -> km, 2 decimals
    friendsGoing: row.friendsGoing || [],
  };
}

function formatFullEvent(row: any): any {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    venueName: row.venue_name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    googlePlaceId: row.google_place_id,
    startTime: row.start_time,
    endTime: row.end_time,
    timezone: row.timezone,
    coverImageUrl: row.cover_image_url,
    imageUrls: row.image_urls || [],
    videoUrl: row.video_url,
    youtubeAdUrl: row.youtube_ad_url,
    isFree: row.is_free,
    priceRange: row.price_min != null
      ? { min: row.price_min, max: row.price_max, currency: row.currency || 'TWD' }
      : undefined,
    externalTicketUrl: row.external_ticket_url,
    attendingCount: row.attending_count,
    interestedCount: row.interested_count,
    viewCount: row.view_count,
    organizerId: row.organizer_id,
    tags: row.tags || [],
    isPromoted: row.is_promoted,
    promotionTier: row.promotion_tier,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Compute date boundaries for preset date ranges using Asia/Taipei timezone.
 */
function getDateBoundaries(dateRange: string): { start: Date; end: Date } {
  // Get current time in Asia/Taipei
  const nowTaipei = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  const year = nowTaipei.getFullYear();
  const month = nowTaipei.getMonth();
  const date = nowTaipei.getDate();
  const dayOfWeek = nowTaipei.getDay(); // 0=Sun

  // Create dates in Taipei timezone (UTC+8)
  const startOfDay = new Date(`${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}T00:00:00+08:00`);

  switch (dateRange) {
    case 'today': {
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      return { start: startOfDay, end: endOfDay };
    }
    case 'this_week': {
      // Monday to Sunday
      const monday = new Date(startOfDay);
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      monday.setDate(monday.getDate() - diff);
      const nextMonday = new Date(monday);
      nextMonday.setDate(nextMonday.getDate() + 7);
      return { start: monday, end: nextMonday };
    }
    case 'this_weekend': {
      // Saturday to Sunday end
      const saturday = new Date(startOfDay);
      const daysUntilSat = (6 - dayOfWeek + 7) % 7;
      saturday.setDate(saturday.getDate() + (daysUntilSat === 0 && dayOfWeek === 6 ? 0 : daysUntilSat));
      const mondayAfter = new Date(saturday);
      mondayAfter.setDate(mondayAfter.getDate() + 2);
      return { start: saturday, end: mondayAfter };
    }
    case 'this_month': {
      const startOfMonth = new Date(`${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00+08:00`);
      const startOfNextMonth = new Date(startOfMonth);
      startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
      return { start: startOfMonth, end: startOfNextMonth };
    }
    default:
      return { start: startOfDay, end: new Date(startOfDay.getTime() + 365 * 24 * 60 * 60 * 1000) };
  }
}

/**
 * Populate friendsGoing for a list of event IDs for the given user.
 * Returns a map of eventId -> FriendAttendance[]
 */
async function getFriendsGoingMap(userId: string, eventIds: string[]): Promise<Record<string, any[]>> {
  if (eventIds.length === 0) return {};

  const rows = await db('event_interactions as ei')
    .join('users as u', 'u.id', 'ei.user_id')
    .join('friendships as f', function () {
      this.on(function () {
        this.on('f.user_id', '=', db.raw('?', [userId]));
        this.on('f.friend_id', '=', 'ei.user_id');
      }).orOn(function () {
        this.on('f.friend_id', '=', db.raw('?', [userId]));
        this.on('f.user_id', '=', 'ei.user_id');
      });
    })
    .where('f.status', 'accepted')
    .whereIn('ei.event_id', eventIds)
    .select(
      'ei.event_id',
      'u.id as user_id',
      'u.display_name',
      'u.avatar_url',
      'ei.type as status',
    );

  const map: Record<string, any[]> = {};
  for (const row of rows) {
    if (!map[row.event_id]) map[row.event_id] = [];
    map[row.event_id].push({
      userId: row.user_id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      status: row.status,
    });
  }
  return map;
}

// ─── Controllers ────────────────────────────────────────────

/**
 * GET /events — List events with filters
 */
export async function listEvents(req: Request, res: Response): Promise<void> {
  const {
    categories, dateRange, startDate, endDate,
    maxDistance, latitude, longitude,
    isFree, search, sortBy,
    page, pageSize,
  } = req.query as any;

  const pageNum = Number(page) || 1;
  const pageSizeNum = Number(pageSize) || 20;
  const offset = (pageNum - 1) * pageSizeNum;

  const query = db('events as e')
    .where('e.status', 'published')
    .where('e.start_time', '>=', new Date());

  // Select columns
  const selectCols = [...EVENT_SUMMARY_COLUMNS];

  // Distance select + filter
  if (latitude != null && longitude != null) {
    selectCols.push(
      db.raw(
        'ST_Distance(e.location, ST_MakePoint(?, ?)::geography) as distance',
        [Number(longitude), Number(latitude)],
      ) as any,
    );
    if (maxDistance) {
      query.whereRaw(
        'ST_DWithin(e.location, ST_MakePoint(?, ?)::geography, ?)',
        [Number(longitude), Number(latitude), Number(maxDistance) * 1000],
      );
    }
  }

  // Category filter
  if (categories) {
    const cats = typeof categories === 'string' ? categories.split(',') : categories;
    query.whereIn('e.category', cats);
  }

  // Date filter
  if (dateRange && dateRange !== 'custom') {
    const { start, end } = getDateBoundaries(dateRange);
    query.where('e.start_time', '>=', start);
    query.where('e.start_time', '<', end);
  } else if (dateRange === 'custom' && startDate && endDate) {
    query.where('e.start_time', '>=', new Date(startDate as string));
    query.where('e.start_time', '<=', new Date(endDate as string));
  }

  // Free filter
  if (isFree === 'true' || isFree === true) {
    query.where('e.is_free', true);
  }

  // Full-text search
  if (search) {
    query.whereRaw(
      "to_tsvector('simple', e.title) || to_tsvector('simple', coalesce(e.description, '')) @@ plainto_tsquery('simple', ?)",
      [search],
    );
  }

  // Count total before pagination
  const countQuery = query.clone().clearSelect().clearOrder().count('* as total').first();

  // Sort
  const sort = sortBy || 'popularity';
  switch (sort) {
    case 'popularity':
      query.orderBy('e.attending_count', 'desc');
      break;
    case 'date':
      query.orderBy('e.start_time', 'asc');
      break;
    case 'distance':
      if (latitude != null && longitude != null) {
        query.orderByRaw('ST_Distance(e.location, ST_MakePoint(?, ?)::geography) ASC', [Number(longitude), Number(latitude)]);
      }
      break;
    case 'price':
      query.orderByRaw('e.price_min ASC NULLS LAST');
      break;
  }

  // Promoted events first
  query.orderBy('e.is_promoted', 'desc');

  // Pagination
  query.select(selectCols).offset(offset).limit(pageSizeNum);

  const [totalResult, events] = await Promise.all([countQuery, query]);
  const total = Number((totalResult as any)?.total || 0);

  // Populate friendsGoing if authenticated
  let friendsMap: Record<string, any[]> = {};
  const userId = (req as any).user?.id;
  if (userId && events.length > 0) {
    const eventIds = events.map((e: any) => e.id);
    friendsMap = await getFriendsGoingMap(userId, eventIds);
  }

  const items = events.map((e: any) => {
    e.friendsGoing = friendsMap[e.id] || [];
    return formatEventSummary(e);
  });

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
 * GET /events/trending — Trending events
 */
export async function getTrending(req: Request, res: Response): Promise<void> {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const latitude = req.query.latitude ? Number(req.query.latitude) : null;
  const longitude = req.query.longitude ? Number(req.query.longitude) : null;

  const selectCols = [...EVENT_SUMMARY_COLUMNS];
  if (latitude != null && longitude != null) {
    selectCols.push(
      db.raw(
        'ST_Distance(e.location, ST_MakePoint(?, ?)::geography) as distance',
        [longitude, latitude],
      ) as any,
    );
  }

  const query = db('events as e')
    .select(selectCols)
    .where('e.status', 'published')
    .where('e.start_time', '>=', new Date())
    .orderByRaw(`
      (e.attending_count + e.interested_count + e.view_count) DESC,
      CASE WHEN e.promotion_tier = 'premium' THEN 3
           WHEN e.promotion_tier = 'featured' THEN 2
           WHEN e.promotion_tier = 'standard' THEN 1
           ELSE 0 END DESC
    `)
    .limit(limit);

  const events = await query;

  // Populate friendsGoing if authenticated
  let friendsMap: Record<string, any[]> = {};
  const userId = (req as any).user?.id;
  if (userId && events.length > 0) {
    friendsMap = await getFriendsGoingMap(userId, events.map((e: any) => e.id));
  }

  const items = events.map((e: any) => {
    e.friendsGoing = friendsMap[e.id] || [];
    return formatEventSummary(e);
  });

  res.json({ success: true, data: items });
}

/**
 * GET /events/nearby — Nearby events
 */
export async function getNearby(req: Request, res: Response): Promise<void> {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  const radius = Number(req.query.radius) || 5;
  const pageNum = Number(req.query.page) || 1;
  const pageSizeNum = Number(req.query.pageSize) || 20;
  const offset = (pageNum - 1) * pageSizeNum;
  const radiusMeters = radius * 1000;

  const selectCols = [
    ...EVENT_SUMMARY_COLUMNS,
    db.raw(
      'ST_Distance(e.location, ST_MakePoint(?, ?)::geography) as distance',
      [longitude, latitude],
    ),
  ];

  const baseQuery = db('events as e')
    .where('e.status', 'published')
    .where('e.start_time', '>=', new Date())
    .whereRaw(
      'ST_DWithin(e.location, ST_MakePoint(?, ?)::geography, ?)',
      [longitude, latitude, radiusMeters],
    );

  const countQuery = baseQuery.clone().count('* as total').first();

  const eventsQuery = baseQuery.clone()
    .select(selectCols)
    .orderByRaw('ST_Distance(e.location, ST_MakePoint(?, ?)::geography) ASC', [longitude, latitude])
    .offset(offset)
    .limit(pageSizeNum);

  const [totalResult, events] = await Promise.all([countQuery, eventsQuery]);
  const total = Number((totalResult as any)?.total || 0);

  let friendsMap: Record<string, any[]> = {};
  const userId = (req as any).user?.id;
  if (userId && events.length > 0) {
    friendsMap = await getFriendsGoingMap(userId, events.map((e: any) => e.id));
  }

  const items = events.map((e: any) => {
    e.friendsGoing = friendsMap[e.id] || [];
    return formatEventSummary(e);
  });

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
 * GET /events/map-markers — Map markers within bounding box
 */
export async function getMapMarkers(req: Request, res: Response): Promise<void> {
  const northEastLat = Number(req.query.northEastLat);
  const northEastLng = Number(req.query.northEastLng);
  const southWestLat = Number(req.query.southWestLat);
  const southWestLng = Number(req.query.southWestLng);
  const categories = req.query.categories as string | undefined;

  const query = db('events as e')
    .select(
      'e.id',
      'e.latitude',
      'e.longitude',
      'e.title',
      'e.category',
      'e.attending_count',
      'e.is_promoted',
    )
    .where('e.status', 'published')
    .where('e.start_time', '>=', new Date())
    .whereRaw(
      'e.latitude BETWEEN ? AND ? AND e.longitude BETWEEN ? AND ?',
      [southWestLat, northEastLat, southWestLng, northEastLng],
    )
    .limit(200);

  if (categories) {
    const cats = categories.split(',').map((c) => c.trim());
    query.whereIn('e.category', cats);
  }

  const events = await query;

  const markers = events.map((e: any) => ({
    id: e.id,
    latitude: e.latitude,
    longitude: e.longitude,
    title: e.title,
    category: e.category,
    attendingCount: e.attending_count,
    isPromoted: e.is_promoted,
  }));

  res.json({ success: true, data: markers });
}

/**
 * GET /events/:eventId — Event detail
 */
export async function getEventDetail(req: Request, res: Response): Promise<void> {
  const { eventId } = req.params;

  const event = await db('events as e')
    .where('e.id', eventId)
    .where('e.status', 'published')
    .first();

  if (!event) {
    throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
  }

  // Increment view count (fire-and-forget)
  db('events').where('id', eventId).increment('view_count', 1).catch((err: Error) => {
    logger.error(err, 'Failed to increment view_count');
  });

  // Fetch ticket types
  const ticketTypes = await db('ticket_types')
    .where('event_id', eventId)
    .select('*');

  // Fetch organizer info
  const organizer = await db('merchants')
    .where('id', event.organizer_id)
    .first();

  // Build response
  const result: any = {
    ...formatFullEvent(event),
    ticketTypes: ticketTypes.map((tt: any) => ({
      id: tt.id,
      eventId: tt.event_id,
      name: tt.name,
      price: tt.price,
      currency: tt.currency,
      quantity: tt.quantity,
      soldCount: tt.sold_count,
      maxPerUser: tt.max_per_user,
      saleStart: tt.sale_start,
      saleEnd: tt.sale_end,
      description: tt.description,
    })),
    organizer: organizer
      ? {
          id: organizer.id,
          userId: organizer.user_id,
          businessName: organizer.business_name,
          businessType: organizer.business_type,
          logoUrl: organizer.logo_url,
          description: organizer.description,
          contactEmail: organizer.contact_email,
          contactPhone: organizer.contact_phone,
          address: organizer.address,
          googleRating: organizer.google_rating,
          isVerified: organizer.is_verified,
          createdAt: organizer.created_at,
        }
      : undefined,
  };

  // If authenticated, include myInteraction and friendsGoing
  const userId = (req as any).user?.id;
  if (userId) {
    const interaction = await db('event_interactions')
      .where({ event_id: eventId, user_id: userId })
      .first();

    result.myInteraction = interaction
      ? {
          userId: interaction.user_id,
          eventId: interaction.event_id,
          type: interaction.type,
          createdAt: interaction.created_at,
        }
      : undefined;

    const friendsMap = await getFriendsGoingMap(userId, [eventId]);
    result.friendsGoing = friendsMap[eventId] || [];
  } else {
    result.friendsGoing = [];
  }

  res.json({ success: true, data: result });
}

/**
 * GET /events/:eventId/friends-going — Friends going to event (paginated)
 */
export async function getFriendsGoing(req: Request, res: Response): Promise<void> {
  const { eventId } = req.params;
  const userId = (req as any).user!.id;
  const pageNum = Number(req.query.page) || 1;
  const pageSizeNum = Number(req.query.pageSize) || 20;
  const offset = (pageNum - 1) * pageSizeNum;

  // Verify event exists
  const event = await db('events').where('id', eventId).first();
  if (!event) {
    throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
  }

  const baseQuery = db('event_interactions as ei')
    .join('users as u', 'u.id', 'ei.user_id')
    .join('friendships as f', function () {
      this.on(function () {
        this.on('f.user_id', '=', db.raw('?', [userId]));
        this.on('f.friend_id', '=', 'ei.user_id');
      }).orOn(function () {
        this.on('f.friend_id', '=', db.raw('?', [userId]));
        this.on('f.user_id', '=', 'ei.user_id');
      });
    })
    .where('f.status', 'accepted')
    .where('ei.event_id', eventId);

  const countQuery = baseQuery.clone().count('* as total').first();

  const friendsQuery = baseQuery.clone()
    .select(
      'u.id as user_id',
      'u.display_name',
      'u.avatar_url',
      'ei.type as status',
    )
    .offset(offset)
    .limit(pageSizeNum);

  const [totalResult, friends] = await Promise.all([countQuery, friendsQuery]);
  const total = Number((totalResult as any)?.total || 0);

  const items = friends.map((f: any) => ({
    userId: f.user_id,
    displayName: f.display_name,
    avatarUrl: f.avatar_url,
    status: f.status,
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
 * POST /events/:eventId/interactions — Set interaction
 */
export async function setInteraction(req: Request, res: Response): Promise<void> {
  const { eventId } = req.params;
  const userId = (req as any).user!.id;
  const { type } = req.body;

  // Verify event exists
  const event = await db('events')
    .where('id', eventId)
    .where('status', 'published')
    .first();

  if (!event) {
    throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
  }

  // Check for existing interaction
  const existing = await db('event_interactions')
    .where({ event_id: eventId, user_id: userId })
    .first();

  let statusCode: number;

  await db.transaction(async (trx) => {
    if (existing) {
      const oldType = existing.type;

      // Update interaction type
      await trx('event_interactions')
        .where({ event_id: eventId, user_id: userId })
        .update({ type, created_at: new Date() });

      // Decrement old counter
      if (oldType === 'attending') {
        await trx('events').where('id', eventId).decrement('attending_count', 1);
      } else if (oldType === 'interested') {
        await trx('events').where('id', eventId).decrement('interested_count', 1);
      }

      // Increment new counter
      if (type === 'attending') {
        await trx('events').where('id', eventId).increment('attending_count', 1);
      } else if (type === 'interested') {
        await trx('events').where('id', eventId).increment('interested_count', 1);
      }

      statusCode = 200;
    } else {
      // Insert new interaction
      await trx('event_interactions').insert({
        event_id: eventId,
        user_id: userId,
        type,
        created_at: new Date(),
      });

      // Increment counter
      if (type === 'attending') {
        await trx('events').where('id', eventId).increment('attending_count', 1);
      } else if (type === 'interested') {
        await trx('events').where('id', eventId).increment('interested_count', 1);
      }

      statusCode = 201;
    }
  });

  const interaction = await db('event_interactions')
    .where({ event_id: eventId, user_id: userId })
    .first();

  res.status(statusCode!).json({
    success: true,
    data: {
      userId: interaction.user_id,
      eventId: interaction.event_id,
      type: interaction.type,
      createdAt: interaction.created_at,
    },
  });
}

/**
 * DELETE /events/:eventId/interactions — Remove interaction
 */
export async function removeInteraction(req: Request, res: Response): Promise<void> {
  const { eventId } = req.params;
  const userId = (req as any).user!.id;

  const existing = await db('event_interactions')
    .where({ event_id: eventId, user_id: userId })
    .first();

  if (!existing) {
    throw new AppError(404, 'INTERACTION_NOT_FOUND', 'No interaction found to remove');
  }

  await db.transaction(async (trx) => {
    await trx('event_interactions')
      .where({ event_id: eventId, user_id: userId })
      .delete();

    // Decrement counter
    if (existing.type === 'attending') {
      await trx('events').where('id', eventId).decrement('attending_count', 1);
    } else if (existing.type === 'interested') {
      await trx('events').where('id', eventId).decrement('interested_count', 1);
    }
  });

  res.json({ success: true, data: null });
}
