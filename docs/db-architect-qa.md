# DB Architect — Self-QA Checklist

Schema file: `docs/db-schema.sql`

## Checklist

- [x] **All shared TypeScript types have corresponding DB tables**
  - `User` -> `users`
  - `Merchant` -> `merchant_profiles`
  - `Event` -> `events`
  - `TicketType` -> `ticket_types`
  - `Order` -> `orders`
  - `OrderItem` -> `order_items`
  - `Ticket` -> `tickets`
  - `EventInteraction` -> `event_interactions`
  - `Friendship` -> `friendships`
  - `Coupon` -> `coupons`
  - `Notification` -> `notifications`
  - `PromotionPackage` -> `promotion_placements`
  - `UserProfile` is a computed view (eventsAttended, friendCount are derived), no separate table needed.
  - `EventSummary`, `FriendAttendance`, `MapMarker` are read projections, not stored entities.
  - NEW: `user_dating_profiles` and `user_dating_filters` added for dating feature.
  - `venues` table added for normalized venue data with PostGIS.

- [x] **FK relationships are correct and complete**
  - `user_dating_profiles.user_id` -> `users.id` (CASCADE)
  - `user_dating_filters.user_id` -> `users.id` (CASCADE)
  - `merchant_profiles.user_id` -> `users.id` (CASCADE)
  - `events.organizer_id` -> `merchant_profiles.id` (CASCADE)
  - `events.venue_id` -> `venues.id` (SET NULL) — optional link
  - `ticket_types.event_id` -> `events.id` (CASCADE)
  - `orders.user_id` -> `users.id` (CASCADE)
  - `orders.event_id` -> `events.id` (CASCADE)
  - `order_items.order_id` -> `orders.id` (CASCADE)
  - `order_items.ticket_type_id` -> `ticket_types.id` (RESTRICT) — prevent deleting a ticket type with existing order items
  - `tickets.ticket_type_id` -> `ticket_types.id` (RESTRICT)
  - `tickets.event_id` -> `events.id` (CASCADE)
  - `tickets.user_id` -> `users.id` (CASCADE)
  - `tickets.order_id` -> `orders.id` (CASCADE)
  - `event_interactions` (user_id, event_id) -> users, events (CASCADE)
  - `friendships` (user_id, friend_id) -> users (CASCADE)
  - `coupons.event_id` -> `events.id` (CASCADE), nullable for merchant-wide coupons
  - `coupons.merchant_id` -> `merchant_profiles.id` (CASCADE)
  - `notifications.user_id` -> `users.id` (CASCADE)
  - `promotion_placements.event_id` -> `events.id` (CASCADE)
  - `promotion_placements.merchant_id` -> `merchant_profiles.id` (CASCADE)

- [x] **Indexes cover the main query patterns**
  - Events by location: `idx_events_location` (GIST on geography column)
  - Events by date: `idx_events_start_time` (partial index, published only)
  - Events by popularity: `idx_events_popularity` (attending_count DESC, published only)
  - Full-text search: `idx_events_fts` (GIN on tsvector of title + description)
  - Category filter: `idx_events_category`
  - Promoted events: `idx_events_promoted`
  - Venues by location: `idx_venues_location` (GIST)
  - Notifications by user: `idx_notifications_user` (user_id, created_at DESC)
  - Unread notifications: `idx_notifications_unread` (partial)
  - Friendships: `idx_friendships_accepted` (partial for accepted)
  - All FK columns used in JOINs have indexes.

- [x] **Dating profile fields match the requirements**
  - gender: CHECK (male, female, non_binary, other)
  - dating_role: CHECK (top, bottom, vers, vers_top, vers_bottom, side, other)
  - interested_in_genders: TEXT[] array
  - interested_in_roles: TEXT[] array
  - show_on_dating: BOOLEAN (opt-in)
  - dating_bio: TEXT
  - age: INTEGER with range check (18-120)
  - photos: JSONB array of URLs

- [x] **No circular FK dependencies**
  - Dependency order: users -> user_dating_profiles, user_dating_filters, merchant_profiles -> venues -> events -> ticket_types, orders -> order_items, tickets -> event_interactions, friendships, coupons, notifications, promotion_placements
  - All FKs point "downward" in the dependency chain. No cycles.

- [x] **Migration order is valid**
  - Tables can be created in the order listed in the SQL file:
    1. extensions (pgcrypto, postgis)
    2. users
    3. user_dating_profiles
    4. user_dating_filters
    5. merchant_profiles
    6. venues
    7. events (depends on merchant_profiles, venues)
    8. ticket_types (depends on events)
    9. orders (depends on users, events)
    10. order_items (depends on orders, ticket_types)
    11. tickets (depends on ticket_types, events, users, orders)
    12. event_interactions (depends on users, events)
    13. friendships (depends on users)
    14. coupons (depends on events, merchant_profiles)
    15. notifications (depends on users)
    16. promotion_placements (depends on events, merchant_profiles)

- [x] **Data types are appropriate**
  - TWD prices: INTEGER (no decimals) for price_min, price_max, total_amount, unit_price, price_paid, discount_value, ticket price
  - Coordinates: DOUBLE PRECISION for lat/lng
  - Geography: GEOGRAPHY(Point, 4326) for PostGIS spatial queries
  - google_rating: NUMERIC(2,1) for 0.0-5.0
  - Arrays: TEXT[] for tags, interested_in_genders, interested_in_roles, gender_filter, role_filter
  - JSON: JSONB for image_urls, photos, notification data
  - Timestamps: TIMESTAMPTZ throughout

- [x] **PostGIS is properly set up for geo queries**
  - Extension enabled: `CREATE EXTENSION IF NOT EXISTS "postgis"`
  - Geography columns on venues and events: `GEOGRAPHY(Point, 4326)`
  - GIST spatial indexes on both tables
  - WGS-84 (SRID 4326) allows ST_DWithin with meter-based distances

- [x] **All ENUM-like fields use CHECK constraints matching shared constants**
  - `users.role`: user, merchant, admin (matches `User.role`)
  - `events.category`: all 10 values from `EVENT_CATEGORIES`
  - `events.status`: draft, published, cancelled, ended (matches `EventStatus`)
  - `events.promotion_tier`: standard, featured, premium (matches `PROMOTION_TIERS`)
  - `tickets.status`: valid, used, cancelled, refunded (matches `Ticket.status`)
  - `orders.payment_method`: credit_card, apple_pay, google_pay, external (matches `Order.paymentMethod`)
  - `orders.payment_status`: pending, paid, failed, refunded (matches `Order.paymentStatus`)
  - `coupons.discount_type`: percentage, fixed (matches `Coupon.discountType`)
  - `event_interactions.type`: attending, interested, want_to_go (matches `EventInteraction.type`)
  - `friendships.status`: pending, accepted, blocked (matches `Friendship.status`)
  - `notifications.type`: event_reminder, friend_going, hot_tonight, ticket_confirmed, promotion (matches `Notification.type`)
  - `merchant_profiles.business_type`: venue, organizer, brand (matches `Merchant.businessType`)
  - `user_dating_profiles.gender`: male, female, non_binary, other
  - `user_dating_profiles.dating_role`: top, bottom, vers, vers_top, vers_bottom, side, other
  - `promotion_placements.tier`: standard, featured, premium

- [x] **Composite primary keys and unique constraints are correct**
  - `event_interactions`: composite PK on (user_id, event_id) — one interaction type per user per event
  - `friendships`: UNIQUE (user_id, friend_id) — no duplicate friendship rows in same direction, plus self-friendship CHECK
  - `users.email`: UNIQUE
  - `coupons.code`: UNIQUE
  - `tickets.qr_code`: UNIQUE
  - `user_dating_profiles.user_id`: UNIQUE (1:1)
  - `user_dating_filters.user_id`: UNIQUE (1:1)
  - `merchant_profiles.user_id`: UNIQUE (1:1)
