import { Request, Response } from 'express';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const DEFAULT_DATING_FILTERS = {
  genders: [],
  roles: [],
  ageRange: { min: 18, max: 99 },
  maxDistance: 50,
};

// ─── Get Dating Profile ─────────────────────────────────────
export async function getDatingProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const profile = await db('user_dating_profiles').where('user_id', userId).first();

  if (!profile) {
    throw new AppError(404, 'DATING_PROFILE_NOT_FOUND', 'No dating profile exists yet');
  }

  res.json({
    success: true,
    data: formatDatingProfile(profile),
  });
}

// ─── Upsert Dating Profile ─────────────────────────────────
export async function upsertDatingProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { gender, role, interestedInGenders, interestedInRoles, bio, photos, showOnDating, age } = req.body;

  const existing = await db('user_dating_profiles').where('user_id', userId).first();

  const profileData = {
    user_id: userId,
    gender,
    role,
    interested_in_genders: JSON.stringify(interestedInGenders),
    interested_in_roles: JSON.stringify(interestedInRoles),
    bio: bio || '',
    photos: JSON.stringify(photos || []),
    show_on_dating: showOnDating ?? false,
    age,
    updated_at: db.fn.now(),
  };

  let profile;
  let statusCode: number;

  if (existing) {
    [profile] = await db('user_dating_profiles')
      .where('user_id', userId)
      .update(profileData)
      .returning('*');
    statusCode = 200;
  } else {
    [profile] = await db('user_dating_profiles')
      .insert({ ...profileData, created_at: db.fn.now() })
      .returning('*');
    statusCode = 201;
  }

  res.status(statusCode).json({
    success: true,
    data: formatDatingProfile(profile),
  });
}

// ─── Get Dating Filters ─────────────────────────────────────
export async function getDatingFilters(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const filters = await db('user_dating_filters').where('user_id', userId).first();

  if (!filters) {
    res.json({ success: true, data: DEFAULT_DATING_FILTERS });
    return;
  }

  res.json({
    success: true,
    data: formatDatingFilters(filters),
  });
}

// ─── Update Dating Filters ──────────────────────────────────
export async function updateDatingFilters(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { genders, roles, ageRange, maxDistance } = req.body;

  const filterData = {
    user_id: userId,
    genders: JSON.stringify(genders),
    roles: JSON.stringify(roles),
    age_range_min: ageRange.min,
    age_range_max: ageRange.max,
    max_distance: maxDistance,
    updated_at: db.fn.now(),
  };

  const existing = await db('user_dating_filters').where('user_id', userId).first();

  let result;
  if (existing) {
    [result] = await db('user_dating_filters')
      .where('user_id', userId)
      .update(filterData)
      .returning('*');
  } else {
    [result] = await db('user_dating_filters')
      .insert({ ...filterData, created_at: db.fn.now() })
      .returning('*');
  }

  res.json({
    success: true,
    data: formatDatingFilters(result),
  });
}

// ─── Discover People ────────────────────────────────────────
export async function discoverPeople(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { latitude, longitude, eventId, page = 1, pageSize = 20 } = req.query as {
    latitude?: number;
    longitude?: number;
    eventId?: string;
    page?: number;
    pageSize?: number;
  };

  const lat = Number(latitude);
  const lng = Number(longitude);
  const offset = (Number(page) - 1) * Number(pageSize);

  // Get current user's dating filters
  const filtersRow = await db('user_dating_filters').where('user_id', userId).first();
  const filters = filtersRow
    ? formatDatingFilters(filtersRow)
    : DEFAULT_DATING_FILTERS;

  // Build filter conditions
  const conditions: string[] = [];
  const params: any[] = [];

  // Base: show_on_dating = true, exclude self
  conditions.push('dp.show_on_dating = true');
  conditions.push('dp.user_id != ?');
  params.push(userId);

  // Gender filter
  if (filters.genders.length > 0) {
    conditions.push(`dp.gender IN (${filters.genders.map(() => '?').join(', ')})`);
    params.push(...filters.genders);
  }

  // Role filter
  if (filters.roles.length > 0) {
    conditions.push(`dp.role IN (${filters.roles.map(() => '?').join(', ')})`);
    params.push(...filters.roles);
  }

  // Age filter
  conditions.push('dp.age >= ?');
  params.push(filters.ageRange.min);
  conditions.push('dp.age <= ?');
  params.push(filters.ageRange.max);

  // Distance filter using Haversine formula (PostGIS not assumed)
  // Distance in km using lat/lng
  const distanceExpr = `
    (6371 * acos(
      LEAST(1.0, cos(radians(?)) * cos(radians(dp.latitude)) *
      cos(radians(dp.longitude) - radians(?)) +
      sin(radians(?)) * sin(radians(dp.latitude)))
    ))
  `;
  params.push(lat, lng, lat);

  if (filters.maxDistance > 0) {
    conditions.push(`${distanceExpr} <= ?`);
    params.push(lat, lng, lat); // repeated for the WHERE clause copy
    params.push(filters.maxDistance);
  }

  // Event filter
  let eventJoin = '';
  if (eventId) {
    eventJoin = 'JOIN event_interactions ei_filter ON ei_filter.user_id = dp.user_id AND ei_filter.event_id = ?';
    params.push(eventId);
  }

  // Build the query for distance in SELECT
  const selectDistanceParams = [lat, lng, lat];

  // Mutual friends subquery
  const mutualFriendsSubquery = `
    (SELECT COUNT(*) FROM friendships f1
     JOIN friendships f2 ON (
       CASE WHEN f1.user_id = dp.user_id THEN f1.friend_id ELSE f1.user_id END
       = CASE WHEN f2.user_id = ? THEN f2.friend_id ELSE f2.user_id END
     )
     WHERE f1.status = 'accepted'
       AND f2.status = 'accepted'
       AND (f1.user_id = dp.user_id OR f1.friend_id = dp.user_id)
       AND (f2.user_id = ? OR f2.friend_id = ?))
  `;

  // Shared events subquery
  const sharedEventsSubquery = `
    (SELECT COUNT(DISTINCT ei1.event_id)
     FROM event_interactions ei1
     JOIN event_interactions ei2 ON ei1.event_id = ei2.event_id
     WHERE ei1.user_id = dp.user_id
       AND ei2.user_id = ?
       AND ei1.type IN ('attending', 'interested')
       AND ei2.type IN ('attending', 'interested'))
  `;

  // Reassemble with correct param ordering
  // We need to carefully construct the full query and params array
  const allParams: any[] = [];

  // SELECT distance params
  allParams.push(lat, lng, lat);
  // mutual friends params
  allParams.push(userId, userId, userId);
  // shared events params
  allParams.push(userId);
  // event join param
  if (eventId) {
    allParams.push(eventId);
  }
  // WHERE conditions params
  allParams.push(userId); // exclude self

  if (filters.genders.length > 0) {
    allParams.push(...filters.genders);
  }
  if (filters.roles.length > 0) {
    allParams.push(...filters.roles);
  }

  allParams.push(filters.ageRange.min);
  allParams.push(filters.ageRange.max);

  if (filters.maxDistance > 0) {
    allParams.push(lat, lng, lat, filters.maxDistance);
  }

  // pagination
  allParams.push(Number(pageSize), offset);

  const distSelectExpr = `
    (6371 * acos(
      LEAST(1.0, cos(radians(?)) * cos(radians(dp.latitude)) *
      cos(radians(dp.longitude) - radians(?)) +
      sin(radians(?)) * sin(radians(dp.latitude)))
    )) AS distance
  `;

  const distWhereExpr = filters.maxDistance > 0
    ? `AND (6371 * acos(
        LEAST(1.0, cos(radians(?)) * cos(radians(dp.latitude)) *
        cos(radians(dp.longitude) - radians(?)) +
        sin(radians(?)) * sin(radians(dp.latitude)))
      )) <= ?`
    : '';

  const genderWhere = filters.genders.length > 0
    ? `AND dp.gender IN (${filters.genders.map(() => '?').join(', ')})`
    : '';

  const roleWhere = filters.roles.length > 0
    ? `AND dp.role IN (${filters.roles.map(() => '?').join(', ')})`
    : '';

  const eventJoinClause = eventId
    ? 'JOIN event_interactions ei_filter ON ei_filter.user_id = dp.user_id AND ei_filter.event_id = ?'
    : '';

  const sql = `
    SELECT
      dp.user_id,
      u.display_name,
      dp.age,
      dp.gender,
      dp.role,
      dp.bio,
      dp.photos,
      ${distSelectExpr},
      ${mutualFriendsSubquery} AS mutual_friend_count,
      ${sharedEventsSubquery} AS shared_event_count,
      COUNT(*) OVER() AS total_count
    FROM user_dating_profiles dp
    JOIN users u ON u.id = dp.user_id
    ${eventJoinClause}
    WHERE dp.show_on_dating = true
      AND dp.user_id != ?
      ${genderWhere}
      ${roleWhere}
      AND dp.age >= ?
      AND dp.age <= ?
      ${distWhereExpr}
    ORDER BY distance ASC
    LIMIT ? OFFSET ?
  `;

  const result = await db.raw(sql, allParams);
  const rows = result.rows || result;
  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

  // Map to DiscoverPerson — never expose sensitive data
  const items = rows.map((row: any) => ({
    userId: row.user_id,
    displayName: row.display_name,
    age: row.age,
    gender: row.gender,
    role: row.role,
    bio: row.bio || '',
    photos: parseJsonField(row.photos, []),
    distance: Math.round(Number(row.distance) * 10) / 10,
    mutualFriendCount: Number(row.mutual_friend_count),
    sharedEventCount: Number(row.shared_event_count),
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

// ─── Helpers ────────────────────────────────────────────────

function parseJsonField(value: any, fallback: any): any {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function formatDatingProfile(row: any) {
  return {
    userId: row.user_id,
    gender: row.gender,
    role: row.role,
    interestedInGenders: parseJsonField(row.interested_in_genders, []),
    interestedInRoles: parseJsonField(row.interested_in_roles, []),
    bio: row.bio || '',
    photos: parseJsonField(row.photos, []),
    showOnDating: row.show_on_dating,
    age: row.age,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatDatingFilters(row: any) {
  return {
    genders: parseJsonField(row.genders, []),
    roles: parseJsonField(row.roles, []),
    ageRange: { min: row.age_range_min, max: row.age_range_max },
    maxDistance: row.max_distance,
  };
}
