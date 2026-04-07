# FOMO App — REST API Specification (MVP)

**Base URL:** `/api/v1`  
**Auth:** `Authorization: Bearer <jwt>`  
**Pagination:** `page` (default 1) + `pageSize` (default 20) query params  
**Response wrapper:** `ApiResponse<T>` for single items, `ApiResponse<PaginatedResponse<T>>` for lists  
**Error format:** `{ success: false, message: string, code: string }`  
**Date format:** ISO 8601 (`2026-04-07T20:00:00+08:00`)

---

## 1. Auth

### 1.1 Register

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/register` |
| **Auth** | No |

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 chars)",
  "displayName": "string (required)"
}
```

**Response:** `ApiResponse<{ user: User, accessToken: string, refreshToken: string }>`

**Status Codes:**
- `201` — Created
- `409` — Email already registered (`EMAIL_ALREADY_EXISTS`)
- `422` — Validation error (`VALIDATION_ERROR`)

**Notes:** Password is hashed server-side. `accessToken` is a short-lived JWT (15 min). `refreshToken` is a long-lived opaque token (30 days).

---

### 1.2 Login

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/login` |
| **Auth** | No |

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:** `ApiResponse<{ user: User, accessToken: string, refreshToken: string }>`

**Status Codes:**
- `200` — OK
- `401` — Invalid credentials (`INVALID_CREDENTIALS`)

---

### 1.3 Refresh Token

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/refresh` |
| **Auth** | No |

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response:** `ApiResponse<{ accessToken: string, refreshToken: string }>`

**Status Codes:**
- `200` — OK
- `401` — Invalid or expired refresh token (`INVALID_REFRESH_TOKEN`)

**Notes:** Rotates the refresh token on each use (old token is invalidated).

---

### 1.4 Get Current User

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/auth/me` |
| **Auth** | Yes |

**Response:** `ApiResponse<User>`

**Status Codes:**
- `200` — OK
- `401` — Unauthorized (`UNAUTHORIZED`)

---

## 2. Events

### 2.1 List Events (with filters)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/events` |
| **Auth** | Optional (auth adds friend-going data) |

**Query Params** (all optional, matching `EventFilters`):
| Param | Type | Description |
|---|---|---|
| `categories` | `string` | Comma-separated `EventCategory` values |
| `dateRange` | `string` | `today`, `this_week`, `this_weekend`, `this_month`, `custom` |
| `startDate` | `string` | ISO date (required when `dateRange=custom`) |
| `endDate` | `string` | ISO date (required when `dateRange=custom`) |
| `maxDistance` | `number` | Max distance in km |
| `latitude` | `number` | User latitude (required if `maxDistance` or `sortBy=distance`) |
| `longitude` | `number` | User longitude (required if `maxDistance` or `sortBy=distance`) |
| `isFree` | `boolean` | Filter free events only |
| `search` | `string` | Full-text search on title, description, tags |
| `sortBy` | `string` | `date`, `distance`, `popularity`, `price` |
| `page` | `number` | Default 1 |
| `pageSize` | `number` | Default 20 |

**Response:** `ApiResponse<PaginatedResponse<EventSummary>>`

**Notes:**
- `friendsGoing` in each `EventSummary` is populated only when authenticated.
- Default sort is `popularity`.
- Only `published` events with `startTime` >= now are returned (unless `dateRange` specifies past).

---

### 2.2 Trending Events

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/events/trending` |
| **Auth** | Optional |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `limit` | `number` | Max results (default 10, max 50) |
| `latitude` | `number` | Optional, for geo-relevance |
| `longitude` | `number` | Optional, for geo-relevance |

**Response:** `ApiResponse<EventSummary[]>`

**Notes:** Returns events ranked by a composite score of `attendingCount`, `interestedCount`, `viewCount`, recency, and promotion tier. Promoted events may be boosted.

---

### 2.3 Nearby Events

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/events/nearby` |
| **Auth** | Optional |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `latitude` | `number` | Required |
| `longitude` | `number` | Required |
| `radius` | `number` | Radius in km (default 5, max 50) |
| `page` | `number` | Default 1 |
| `pageSize` | `number` | Default 20 |

**Response:** `ApiResponse<PaginatedResponse<EventSummary>>`

---

### 2.4 Map Markers

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/events/map-markers` |
| **Auth** | Optional |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `northEastLat` | `number` | Required — bounding box |
| `northEastLng` | `number` | Required |
| `southWestLat` | `number` | Required |
| `southWestLng` | `number` | Required |
| `categories` | `string` | Optional comma-separated filter |

**Response:** `ApiResponse<MapMarker[]>`

**Notes:** Returns all published upcoming events within the viewport bounding box. Not paginated (clustered on client). Max 200 markers returned; server may cluster dense regions.

---

### 2.5 Event Detail

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/events/:eventId` |
| **Auth** | Optional |

**Path Params:**
| Param | Type |
|---|---|
| `eventId` | `string` |

**Response:** `ApiResponse<Event & { myInteraction?: EventInteraction, friendsGoing: FriendAttendance[] }>`

**Status Codes:**
- `200` — OK
- `404` — Event not found (`EVENT_NOT_FOUND`)

**Notes:** Increments `viewCount`. `myInteraction` is populated only when authenticated. `friendsGoing` populated only when authenticated.

---

### 2.6 Friends Going to Event

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/events/:eventId/friends-going` |
| **Auth** | Yes |

**Path Params:**
| Param | Type |
|---|---|
| `eventId` | `string` |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `page` | `number` | Default 1 |
| `pageSize` | `number` | Default 20 |

**Response:** `ApiResponse<PaginatedResponse<FriendAttendance>>`

---

## 3. Event Interactions

### 3.1 Set Interaction (attending / interested / want_to_go)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/events/:eventId/interactions` |
| **Auth** | Yes |

**Path Params:**
| Param | Type |
|---|---|
| `eventId` | `string` |

**Request Body:**
```json
{
  "type": "attending | interested | want_to_go"
}
```

**Response:** `ApiResponse<EventInteraction>`

**Status Codes:**
- `200` — Updated existing interaction
- `201` — Created new interaction
- `404` — Event not found (`EVENT_NOT_FOUND`)

**Notes:** A user can only have one interaction type per event. Posting a new type replaces the previous one. Setting `attending` also sends a notification to friends.

---

### 3.2 Remove Interaction

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/events/:eventId/interactions` |
| **Auth** | Yes |

**Path Params:**
| Param | Type |
|---|---|
| `eventId` | `string` |

**Response:** `ApiResponse<null>`

**Status Codes:**
- `200` — Removed
- `404` — No interaction found (`INTERACTION_NOT_FOUND`)

---

## 4. Social / Friends

### 4.1 List Friends

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/friends` |
| **Auth** | Yes |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `search` | `string` | Search by displayName |
| `page` | `number` | Default 1 |
| `pageSize` | `number` | Default 20 |

**Response:** `ApiResponse<PaginatedResponse<User>>`

---

### 4.2 Send Friend Request

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/friends/requests` |
| **Auth** | Yes |

**Request Body:**
```json
{
  "userId": "string (required)"
}
```

**Response:** `ApiResponse<Friendship>`

**Status Codes:**
- `201` — Request sent
- `409` — Already friends or request pending (`FRIEND_REQUEST_EXISTS`)
- `404` — Target user not found (`USER_NOT_FOUND`)

---

### 4.3 List Pending Friend Requests

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/friends/requests` |
| **Auth** | Yes |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `direction` | `string` | `incoming` (default) or `outgoing` |
| `page` | `number` | Default 1 |
| `pageSize` | `number` | Default 20 |

**Response:** `ApiResponse<PaginatedResponse<Friendship & { user: User }>>`

**Notes:** `user` is the other party (sender for incoming, recipient for outgoing).

---

### 4.4 Accept Friend Request

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/friends/requests/:requestId/accept` |
| **Auth** | Yes |

**Response:** `ApiResponse<Friendship>`

**Status Codes:**
- `200` — Accepted
- `403` — Not the recipient (`FORBIDDEN`)
- `404` — Request not found (`REQUEST_NOT_FOUND`)

---

### 4.5 Reject Friend Request

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/friends/requests/:requestId/reject` |
| **Auth** | Yes |

**Response:** `ApiResponse<null>`

**Status Codes:**
- `200` — Rejected
- `403` — Not the recipient (`FORBIDDEN`)
- `404` — Request not found (`REQUEST_NOT_FOUND`)

---

### 4.6 Remove Friend

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/friends/:userId` |
| **Auth** | Yes |

**Response:** `ApiResponse<null>`

**Status Codes:**
- `200` — Removed
- `404` — Friendship not found (`FRIENDSHIP_NOT_FOUND`)

---

### 4.7 Friend Activity Feed

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/friends/activity` |
| **Auth** | Yes |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `page` | `number` | Default 1 |
| `pageSize` | `number` | Default 20 |

**Response:** `ApiResponse<PaginatedResponse<FriendActivity>>`

**`FriendActivity` shape:**
```typescript
interface FriendActivity {
  id: string;
  user: { id: string; displayName: string; avatarUrl?: string };
  type: 'attending' | 'interested' | 'want_to_go';
  event: EventSummary;
  createdAt: string;
}
```

**Notes:** Shows recent event interactions by friends, sorted by recency.

---

## 5. Dating Profile

### 5.1 Get My Dating Profile

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/users/me/dating-profile` |
| **Auth** | Yes |

**Response:** `ApiResponse<DatingProfile>`

**`DatingProfile` shape:**
```typescript
interface DatingProfile {
  userId: string;
  gender: 'male' | 'female' | 'non_binary' | 'other';
  role: 'top' | 'bottom' | 'versatile' | 'none';
  interestedInGenders: ('male' | 'female' | 'non_binary' | 'other')[];
  interestedInRoles: ('top' | 'bottom' | 'versatile' | 'none')[];
  bio: string;
  photos: string[];       // URLs, max 6
  showOnDating: boolean;
  age: number;
  createdAt: string;
  updatedAt: string;
}
```

**Status Codes:**
- `200` — OK
- `404` — No dating profile exists yet (`DATING_PROFILE_NOT_FOUND`)

---

### 5.2 Create / Update My Dating Profile

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/users/me/dating-profile` |
| **Auth** | Yes |

**Request Body:**
```json
{
  "gender": "male | female | non_binary | other (required)",
  "role": "top | bottom | versatile | none (required)",
  "interestedInGenders": ["male", "female"],
  "interestedInRoles": ["versatile"],
  "bio": "string (max 500 chars)",
  "photos": ["url1", "url2"],
  "showOnDating": true,
  "age": 25
}
```

**Response:** `ApiResponse<DatingProfile>`

**Status Codes:**
- `200` — Updated
- `201` — Created (first time)
- `422` — Validation error (`VALIDATION_ERROR`)

**Notes:** Uses PUT for idempotent upsert. At least 1 photo is required to set `showOnDating: true`.

---

### 5.3 Get My Dating Filters

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/users/me/dating-filters` |
| **Auth** | Yes |

**Response:** `ApiResponse<DatingFilters>`

**`DatingFilters` shape:**
```typescript
interface DatingFilters {
  genders: ('male' | 'female' | 'non_binary' | 'other')[];
  roles: ('top' | 'bottom' | 'versatile' | 'none')[];
  ageRange: { min: number; max: number };
  maxDistance: number; // km
}
```

**Status Codes:**
- `200` — OK (returns defaults if not yet set)

---

### 5.4 Update My Dating Filters

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/users/me/dating-filters` |
| **Auth** | Yes |

**Request Body:**
```json
{
  "genders": ["male", "female"],
  "roles": ["versatile"],
  "ageRange": { "min": 20, "max": 35 },
  "maxDistance": 25
}
```

**Response:** `ApiResponse<DatingFilters>`

**Status Codes:**
- `200` — Updated
- `422` — Validation error (`VALIDATION_ERROR`)

---

### 5.5 Discover People

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/discover/people` |
| **Auth** | Yes |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `latitude` | `number` | User's current latitude (required) |
| `longitude` | `number` | User's current longitude (required) |
| `eventId` | `string` | Optional — only show people going to this event |
| `page` | `number` | Default 1 |
| `pageSize` | `number` | Default 20 |

**Response:** `ApiResponse<PaginatedResponse<DiscoverPerson>>`

**`DiscoverPerson` shape:**
```typescript
interface DiscoverPerson {
  userId: string;
  displayName: string;
  age: number;
  gender: 'male' | 'female' | 'non_binary' | 'other';
  role: 'top' | 'bottom' | 'versatile' | 'none';
  bio: string;
  photos: string[];
  distance: number;         // km from requester
  mutualFriendCount: number;
  sharedEventCount: number;  // events both are attending/interested
}
```

**Notes:**
- Only returns users who have `showOnDating = true`.
- Results are filtered by the requester's `DatingFilters` (gender, role, age range, distance).
- When `eventId` is provided, results are limited to people with an interaction on that event.
- Does NOT reveal the other user's dating filters.
- Current user is excluded from results.

---

## 6. Tickets & Orders

### 6.1 Create Order

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/orders` |
| **Auth** | Yes |

**Request Body:**
```json
{
  "eventId": "string (required)",
  "items": [
    { "ticketTypeId": "string", "quantity": 1 }
  ],
  "paymentMethod": "credit_card | apple_pay | google_pay",
  "couponCode": "string (optional)"
}
```

**Response:** `ApiResponse<Order & { tickets: Ticket[] }>`

**Status Codes:**
- `201` — Order created, tickets issued
- `400` — Tickets sold out (`TICKETS_SOLD_OUT`)
- `400` — Exceeds max per user (`MAX_PER_USER_EXCEEDED`)
- `400` — Invalid coupon (`INVALID_COUPON`)
- `402` — Payment failed (`PAYMENT_FAILED`)
- `404` — Event or ticket type not found (`NOT_FOUND`)

**Notes:** Atomic operation — payment is charged and tickets are created in a single transaction. If payment fails, no tickets are issued. Applies 5% platform commission. Coupon discount applied before commission.

---

### 6.2 List My Orders

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/orders` |
| **Auth** | Yes |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `page` | `number` | Default 1 |
| `pageSize` | `number` | Default 20 |

**Response:** `ApiResponse<PaginatedResponse<Order>>`

---

### 6.3 Get Order Detail

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/orders/:orderId` |
| **Auth** | Yes |

**Response:** `ApiResponse<Order & { tickets: Ticket[] }>`

**Status Codes:**
- `200` — OK
- `403` — Not your order (`FORBIDDEN`)
- `404` — Order not found (`ORDER_NOT_FOUND`)

---

### 6.4 List My Tickets

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/tickets` |
| **Auth** | Yes |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `status` | `string` | `valid`, `used`, `cancelled`, `refunded` (optional filter) |
| `page` | `number` | Default 1 |
| `pageSize` | `number` | Default 20 |

**Response:** `ApiResponse<PaginatedResponse<Ticket & { event: EventSummary }>>`

---

### 6.5 Get Ticket Detail

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/tickets/:ticketId` |
| **Auth** | Yes |

**Response:** `ApiResponse<Ticket & { event: EventSummary }>`

**Status Codes:**
- `200` — OK
- `403` — Not your ticket (`FORBIDDEN`)
- `404` — Ticket not found (`TICKET_NOT_FOUND`)

---

### 6.6 Get Dynamic QR Code

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/tickets/:ticketId/qr` |
| **Auth** | Yes |

**Response:** `ApiResponse<{ qrPayload: string, expiresAt: string }>`

**Status Codes:**
- `200` — OK
- `403` — Not your ticket (`FORBIDDEN`)
- `404` — Ticket not found (`TICKET_NOT_FOUND`)

**Notes:** Returns a signed, time-limited QR payload (valid ~30 seconds). The client renders this as a QR code. Regenerate by calling again.

---

### 6.7 Validate QR Code (Merchant)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/tickets/validate` |
| **Auth** | Yes (merchant role required) |

**Request Body:**
```json
{
  "qrPayload": "string (required)"
}
```

**Response:** `ApiResponse<{ ticket: Ticket, event: EventSummary, user: { displayName: string, avatarUrl?: string } }>`

**Status Codes:**
- `200` — Valid ticket, marked as used
- `400` — QR expired (`QR_EXPIRED`)
- `400` — Ticket already used (`TICKET_ALREADY_USED`)
- `400` — Ticket cancelled/refunded (`TICKET_INVALID_STATUS`)
- `403` — Not a merchant for this event (`FORBIDDEN`)

**Notes:** Marks the ticket as `used` and sets `usedAt`. Idempotent — scanning an already-used ticket returns `TICKET_ALREADY_USED` with the ticket details.

---

## 7. Coupons

### 7.1 Validate Coupon Code

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/coupons/validate` |
| **Auth** | Yes |

**Request Body:**
```json
{
  "code": "string (required)",
  "eventId": "string (required)"
}
```

**Response:** `ApiResponse<{ valid: boolean, coupon?: Coupon, discountAmount?: number }>`

**Status Codes:**
- `200` — Validation result returned (check `valid` field)

**Notes:** Does not consume the coupon — only checks validity. The coupon is consumed during order creation. Returns `valid: false` if: code not found, coupon expired, max uses reached, coupon not applicable to the given event.

---

## 8. User Profile

### 8.1 Get My Profile

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/users/me` |
| **Auth** | Yes |

**Response:** `ApiResponse<UserProfile>`

---

### 8.2 Update My Profile

| | |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/users/me` |
| **Auth** | Yes |

**Request Body** (all fields optional):
```json
{
  "displayName": "string",
  "avatarUrl": "string",
  "bio": "string (max 300 chars)"
}
```

**Response:** `ApiResponse<UserProfile>`

**Status Codes:**
- `200` — Updated
- `422` — Validation error (`VALIDATION_ERROR`)

---

### 8.3 Get Another User's Profile

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/users/:userId` |
| **Auth** | Yes |

**Response:** `ApiResponse<UserProfile>`

**Status Codes:**
- `200` — OK
- `404` — User not found (`USER_NOT_FOUND`)

**Notes:** Returns public profile only. Does NOT include email, dating filters, or other sensitive data.

---

### 8.4 My Events by Interaction Type

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/users/me/events` |
| **Auth** | Yes |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `type` | `string` | `attending`, `interested`, `want_to_go` (required) |
| `page` | `number` | Default 1 |
| `pageSize` | `number` | Default 20 |

**Response:** `ApiResponse<PaginatedResponse<EventSummary>>`

---

## 9. Notifications

### 9.1 List Notifications

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/notifications` |
| **Auth** | Yes |

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `unreadOnly` | `boolean` | Default `false` |
| `page` | `number` | Default 1 |
| `pageSize` | `number` | Default 20 |

**Response:** `ApiResponse<PaginatedResponse<Notification>>`

---

### 9.2 Mark Notification as Read

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/notifications/:notificationId/read` |
| **Auth** | Yes |

**Response:** `ApiResponse<Notification>`

**Status Codes:**
- `200` — Marked read
- `403` — Not your notification (`FORBIDDEN`)
- `404` — Notification not found (`NOTIFICATION_NOT_FOUND`)

---

### 9.3 Mark All Notifications as Read

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/notifications/read-all` |
| **Auth** | Yes |

**Response:** `ApiResponse<{ updatedCount: number }>`

---

### 9.4 Register Push Token

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/notifications/push-tokens` |
| **Auth** | Yes |

**Request Body:**
```json
{
  "token": "string (required)",
  "platform": "ios | android (required)"
}
```

**Response:** `ApiResponse<null>`

**Status Codes:**
- `200` — Token registered (idempotent)

**Notes:** Replaces any existing token for the same platform. On logout, the client should call DELETE to unregister.

---

### 9.5 Unregister Push Token

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/notifications/push-tokens` |
| **Auth** | Yes |

**Request Body:**
```json
{
  "token": "string (required)"
}
```

**Response:** `ApiResponse<null>`

---

## Error Codes Reference

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 422 | Request body/params failed validation |
| `NOT_FOUND` | 404 | Generic resource not found |
| `EMAIL_ALREADY_EXISTS` | 409 | Registration with duplicate email |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password at login |
| `INVALID_REFRESH_TOKEN` | 401 | Expired or revoked refresh token |
| `EVENT_NOT_FOUND` | 404 | Event ID does not exist |
| `INTERACTION_NOT_FOUND` | 404 | No interaction to remove |
| `USER_NOT_FOUND` | 404 | User ID does not exist |
| `FRIEND_REQUEST_EXISTS` | 409 | Duplicate friend request |
| `REQUEST_NOT_FOUND` | 404 | Friend request not found |
| `FRIENDSHIP_NOT_FOUND` | 404 | Users are not friends |
| `DATING_PROFILE_NOT_FOUND` | 404 | No dating profile created yet |
| `TICKETS_SOLD_OUT` | 400 | No remaining inventory |
| `MAX_PER_USER_EXCEEDED` | 400 | User exceeded ticket purchase limit |
| `INVALID_COUPON` | 400 | Coupon code invalid, expired, or maxed |
| `PAYMENT_FAILED` | 402 | Payment processor rejected charge |
| `ORDER_NOT_FOUND` | 404 | Order ID does not exist |
| `TICKET_NOT_FOUND` | 404 | Ticket ID does not exist |
| `QR_EXPIRED` | 400 | Dynamic QR payload has expired |
| `TICKET_ALREADY_USED` | 400 | Ticket was already scanned |
| `TICKET_INVALID_STATUS` | 400 | Ticket is cancelled or refunded |
| `NOTIFICATION_NOT_FOUND` | 404 | Notification ID does not exist |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
