# QA Checklist: Backend Events API

## Files
- `server/src/routes/events.ts` — Route definitions
- `server/src/controllers/events.controller.ts` — Controller logic
- `server/src/validators/events.validator.ts` — Zod validation schemas
- `server/src/middleware/validate.ts` — Updated to support structured schemas (query/body/params)
- `server/src/routes/index.ts` — Updated to mount events, social, dating routers

## Checklist

- [x] All 8 routes from api-spec Section 2+3 are implemented
  - GET /events (listEvents, optionalAuth, validated)
  - GET /events/trending (getTrending, optionalAuth, validated)
  - GET /events/nearby (getNearby, optionalAuth, validated)
  - GET /events/map-markers (getMapMarkers, optionalAuth, validated)
  - GET /events/:eventId (getEventDetail, optionalAuth)
  - GET /events/:eventId/friends-going (getFriendsGoing, requireAuth, validated)
  - POST /events/:eventId/interactions (setInteraction, requireAuth, validated)
  - DELETE /events/:eventId/interactions (removeInteraction, requireAuth)

- [x] Event listing supports all EventFilters (category, date, distance, free, search, sort)
  - Category: `whereIn('e.category', cats)` with comma-split
  - Date: `getDateBoundaries()` for today/this_week/this_weekend/this_month; custom uses startDate/endDate
  - Distance: `ST_DWithin(e.location, ST_MakePoint(lng, lat)::geography, meters)`
  - Free: `where('e.is_free', true)`
  - Search: `to_tsvector('simple', e.title) || to_tsvector('simple', coalesce(e.description, '')) @@ plainto_tsquery('simple', ?)`
  - Sort: popularity (attending_count DESC), date (start_time ASC), distance (ST_Distance), price (price_min ASC NULLS LAST)

- [x] PostGIS spatial queries used for distance/nearby/map-markers
  - listEvents: ST_DWithin + ST_Distance for distance filter and sort
  - getNearby: ST_DWithin for radius filter, ST_Distance for sort
  - getMapMarkers: latitude/longitude BETWEEN for bounding box (efficient for viewport queries)

- [x] Full-text search uses to_tsvector + plainto_tsquery
  - `to_tsvector('simple', e.title) || to_tsvector('simple', coalesce(e.description, ''))` with `plainto_tsquery('simple', ?)` using parameterized binding

- [x] Pagination consistent (page, pageSize, total, hasMore)
  - listEvents, getNearby, getFriendsGoing all return `{ items, total, page, pageSize, hasMore }`
  - hasMore: `offset + pageSizeNum < total`
  - Default page=1, pageSize=20

- [x] friendsGoing populated when authenticated
  - `getFriendsGoingMap()` joins event_interactions + friendships + users
  - Called in listEvents, getTrending, getNearby when `req.user?.id` exists
  - getEventDetail also populates friendsGoing and myInteraction when authenticated

- [x] view_count incremented on detail view
  - `db('events').where('id', eventId).increment('view_count', 1)` fire-and-forget with error logging

- [x] Interaction upsert updates event counters atomically
  - setInteraction uses `db.transaction()` to: update/insert interaction + decrement old counter + increment new counter
  - removeInteraction uses `db.transaction()` to: delete interaction + decrement counter
  - Only attending and interested have dedicated counters

- [x] All queries use parameterized values (no SQL injection)
  - All `whereRaw` / `orderByRaw` calls use `?` placeholders with parameter arrays
  - Knex builder methods (where, whereIn, etc.) auto-parameterize

- [x] Zod validators cover all input
  - `listEventsSchema`: categories, dateRange, startDate, endDate, maxDistance, latitude, longitude, isFree, search, sortBy, page, pageSize. Refinements for custom date requiring start/end, distance requiring lat/lng.
  - `trendingEventsSchema`: limit (1-50), latitude, longitude
  - `nearbyEventsSchema`: latitude (required), longitude (required), radius (max 50), page, pageSize
  - `mapMarkersSchema`: northEastLat/Lng, southWestLat/Lng (all required), categories (optional)
  - `setInteractionSchema`: body.type enum (attending/interested/want_to_go)
  - `friendsGoingSchema`: page, pageSize

- [x] Response format matches ApiResponse/PaginatedResponse
  - All responses use `{ success: true, data: ... }`
  - Paginated: `{ success: true, data: { items, total, page, pageSize, hasMore } }`
  - Errors: thrown via `AppError(statusCode, 'CODE', 'message')`
