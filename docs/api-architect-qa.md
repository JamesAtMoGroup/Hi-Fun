# API Architect — Self-QA Checklist

## Checklist

- [x] **Every endpoint has consistent naming conventions (kebab-case paths, plural resources)**
  - PASSED. All resource paths use plural nouns: `/events`, `/friends`, `/orders`, `/tickets`, `/notifications`, `/users`. Multi-word segments use kebab-case: `/map-markers`, `/friends-going`, `/push-tokens`, `/dating-profile`, `/dating-filters`, `/read-all`. No camelCase or snake_case in paths.

- [x] **Auth requirements are correctly marked (public vs protected)**
  - PASSED. Public endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`. Optional auth (enhanced with friend data): `GET /events`, `GET /events/trending`, `GET /events/nearby`, `GET /events/map-markers`, `GET /events/:eventId`. All other endpoints require auth. Merchant-only endpoint: `POST /tickets/validate`.

- [x] **All response types reference existing shared TypeScript types**
  - PASSED. Responses use: `User`, `UserProfile`, `Event`, `EventSummary`, `FriendAttendance`, `MapMarker`, `EventInteraction`, `Friendship`, `Ticket`, `Order`, `Coupon`, `Notification`, `ApiResponse<T>`, `PaginatedResponse<T>`, `EventFilters` (query params mirror this type). New types introduced for dating (`DatingProfile`, `DatingFilters`, `DiscoverPerson`) and social (`FriendActivity`) are fully documented inline since they don't yet exist in the shared types file.

- [x] **Dating profile endpoints cover: create/update profile, get profile, set filters, discover people**
  - PASSED. Five endpoints:
    1. `GET /users/me/dating-profile` — get own profile
    2. `PUT /users/me/dating-profile` — create/update profile (upsert)
    3. `GET /users/me/dating-filters` — get filters
    4. `PUT /users/me/dating-filters` — set filters
    5. `GET /discover/people` — browse matching people with optional `eventId` filter

- [x] **Event filtering supports: category, dateRange, distance (lat/lng), free/paid, search text, sort**
  - PASSED. `GET /events` query params include: `categories` (comma-separated), `dateRange` + `startDate`/`endDate`, `maxDistance` + `latitude`/`longitude`, `isFree`, `search`, `sortBy`. These mirror the shared `EventFilters` type exactly.

- [x] **Pagination is consistent across all list endpoints**
  - PASSED. All paginated endpoints use `page` + `pageSize` query params and return `PaginatedResponse<T>` (with `items`, `total`, `page`, `pageSize`, `hasMore`). Non-paginated list endpoints (`/events/trending`, `/events/map-markers`) use `limit` and return arrays directly, which is intentional for small bounded result sets.

- [x] **Error codes are defined for common scenarios**
  - PASSED. 20 error codes defined in the Error Codes Reference table. Covers: auth errors (3), resource not-found errors (8), conflict errors (2), payment/ticket errors (5), rate limiting, and internal server error. Each endpoint lists its applicable error codes and HTTP status.

- [x] **No duplicate endpoints / no missing CRUD operations**
  - PASSED. No duplicate paths or methods. Key verification:
    - Auth: register, login, refresh, me (4 endpoints)
    - Events: list, trending, nearby, map-markers, detail, friends-going (6 endpoints)
    - Event Interactions: set, remove (2 endpoints)
    - Friends: list, send request, list requests, accept, reject, remove, activity feed (7 endpoints)
    - Dating: get profile, set profile, get filters, set filters, discover (5 endpoints)
    - Tickets/Orders: create order, list orders, get order, list tickets, get ticket, get QR, validate QR (7 endpoints)
    - Coupons: validate (1 endpoint)
    - User Profile: get me, update me, get other user, my events (4 endpoints)
    - Notifications: list, mark read, mark all read, register push token, unregister push token (5 endpoints)
    - Total: 41 endpoints

- [x] **API can support the UI flows: browse -> detail -> buy ticket -> navigate, and dating browse -> filter**
  - PASSED. Flow verification:
    1. **Browse -> Detail -> Buy -> Navigate:** `GET /events` (browse with filters) -> `GET /events/:eventId` (detail with ticket types, lat/lng, googlePlaceId) -> `POST /orders` (buy tickets, applies coupon) -> Client uses lat/lng + deeplink constants from shared to open Uber/Google Maps/Apple Maps. Ticket displayed via `GET /tickets/:ticketId` with `GET /tickets/:ticketId/qr` for entry.
    2. **Dating Browse -> Filter:** `PUT /users/me/dating-profile` (create profile) -> `PUT /users/me/dating-filters` (set preferences) -> `GET /discover/people` (paginated, filtered results). Optional `eventId` param enables "people going to same event" discovery.

- [x] **Response shapes don't leak sensitive data (no password_hash, no other users' dating filters)**
  - PASSED. Verification:
    - `User` type has no `password` or `passwordHash` field.
    - `GET /users/:userId` returns `UserProfile` (public fields only) — no email, no dating data.
    - `GET /discover/people` returns `DiscoverPerson` which contains only: userId, displayName, age, gender, role, bio, photos, distance, mutualFriendCount, sharedEventCount. Does NOT include: email, dating filters, interestedInGenders, interestedInRoles, showOnDating flag.
    - Dating filters endpoints (`/users/me/dating-filters`) are scoped to the authenticated user only — no path to access another user's filters.
    - `POST /tickets/validate` (merchant) returns only displayName + avatarUrl of the ticket holder, not full profile.
