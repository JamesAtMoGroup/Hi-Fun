-- ============================================================
-- FOMO App — PostgreSQL Database Schema (MVP)
-- ============================================================
-- Generated: 2026-04-07
-- Target: PostgreSQL 15+ with PostGIS
-- Currency: TWD (no decimals) — all prices stored as INTEGER
-- All PKs: UUID via gen_random_uuid()
-- All timestamps: TIMESTAMPTZ DEFAULT NOW()
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid() (built-in >=PG13, but explicit for safety)
CREATE EXTENSION IF NOT EXISTS "postgis";    -- geography/geometry types + spatial indexes

-- ============================================================
-- 1. USERS
-- ============================================================
-- Core auth table. Roles match shared type: user | merchant | admin.
-- password_hash stores bcrypt/argon2 output; never store plaintext.
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    display_name    TEXT NOT NULL,
    avatar_url      TEXT,
    bio             TEXT,
    role            TEXT NOT NULL DEFAULT 'user'
                        CHECK (role IN ('user', 'merchant', 'admin')),
    expo_push_token TEXT,
    locale          TEXT NOT NULL DEFAULT 'zh-TW'
                        CHECK (locale IN ('zh-TW', 'en')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. USER DATING PROFILES (Tinder-like opt-in)
-- ============================================================
-- One-to-one with users. Only created when user opts in.
-- Photos stored as a JSONB array of URLs (ordered).
CREATE TABLE user_dating_profiles (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    gender                TEXT NOT NULL
                              CHECK (gender IN ('male', 'female', 'non_binary', 'other')),
    dating_role           TEXT NOT NULL
                              CHECK (dating_role IN ('top', 'bottom', 'vers', 'vers_top', 'vers_bottom', 'side', 'other')),
    interested_in_genders TEXT[] NOT NULL DEFAULT '{}',
    interested_in_roles   TEXT[] NOT NULL DEFAULT '{}',
    show_on_dating        BOOLEAN NOT NULL DEFAULT false,
    dating_bio            TEXT,
    age                   INTEGER CHECK (age >= 18 AND age <= 120),
    photos                JSONB NOT NULL DEFAULT '[]',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. USER DATING FILTERS
-- ============================================================
-- What the user wants to see when swiping. One-to-one with users.
-- Arrays allow multi-select for gender/role filters.
CREATE TABLE user_dating_filters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    gender_filter   TEXT[] NOT NULL DEFAULT '{}',
    role_filter     TEXT[] NOT NULL DEFAULT '{}',
    age_range_min   INTEGER NOT NULL DEFAULT 18 CHECK (age_range_min >= 18),
    age_range_max   INTEGER NOT NULL DEFAULT 99 CHECK (age_range_max <= 120),
    max_distance    INTEGER NOT NULL DEFAULT 50,   -- km
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_age_range CHECK (age_range_min <= age_range_max)
);

-- ============================================================
-- 4. MERCHANT PROFILES
-- ============================================================
-- Linked to a user with role='merchant'. business_type matches shared Merchant type.
CREATE TABLE merchant_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name   TEXT NOT NULL,
    business_type   TEXT NOT NULL
                        CHECK (business_type IN ('venue', 'organizer', 'brand')),
    logo_url        TEXT,
    description     TEXT,
    contact_email   TEXT NOT NULL,
    contact_phone   TEXT,
    address         TEXT,
    google_rating   NUMERIC(2,1) CHECK (google_rating >= 0 AND google_rating <= 5),
    is_verified     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. VENUES
-- ============================================================
-- Normalized venue data with PostGIS geography column for distance queries.
-- geography(Point, 4326) stores WGS-84 lng/lat and enables ST_DWithin in meters.
CREATE TABLE venues (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    address         TEXT NOT NULL,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    location        GEOGRAPHY(Point, 4326) NOT NULL,
    google_place_id TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial index for radius queries (ST_DWithin)
CREATE INDEX idx_venues_location ON venues USING GIST (location);

-- ============================================================
-- 6. EVENTS
-- ============================================================
-- Denormalized venue fields (venue_name, address, lat/lng) for fast list reads
-- without JOINs, matching the shared Event type. venue_id is optional FK for
-- normalized lookups. Tags stored as TEXT[] for simplicity.
--
-- category and status use CHECK constraints matching the shared constants.
-- Prices in TWD → INTEGER (no decimals).
CREATE TABLE events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    category            TEXT NOT NULL
                            CHECK (category IN (
                                'nightclub','live_music','market','sports',
                                'exhibition','food_drink','outdoor','workshop',
                                'party','other'
                            )),
    status              TEXT NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','published','cancelled','ended')),

    -- Denormalized venue fields (fast reads)
    venue_name          TEXT NOT NULL,
    address             TEXT NOT NULL,
    latitude            DOUBLE PRECISION NOT NULL,
    longitude           DOUBLE PRECISION NOT NULL,
    location            GEOGRAPHY(Point, 4326) NOT NULL,
    google_place_id     TEXT,

    -- Optional FK to normalized venues table
    venue_id            UUID REFERENCES venues(id) ON DELETE SET NULL,

    -- Time
    start_time          TIMESTAMPTZ NOT NULL,
    end_time            TIMESTAMPTZ NOT NULL,
    timezone            TEXT NOT NULL DEFAULT 'Asia/Taipei',

    -- Media
    cover_image_url     TEXT NOT NULL,
    image_urls          JSONB NOT NULL DEFAULT '[]',
    video_url           TEXT,
    youtube_ad_url      TEXT,

    -- Pricing
    is_free             BOOLEAN NOT NULL DEFAULT false,
    price_min           INTEGER,  -- TWD, no decimals
    price_max           INTEGER,
    currency            TEXT NOT NULL DEFAULT 'TWD',
    external_ticket_url TEXT,

    -- Popularity counters (denormalized, updated via triggers or app logic)
    attending_count     INTEGER NOT NULL DEFAULT 0,
    interested_count    INTEGER NOT NULL DEFAULT 0,
    view_count          INTEGER NOT NULL DEFAULT 0,

    -- Relations
    organizer_id        UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE,
    tags                TEXT[] NOT NULL DEFAULT '{}',

    -- Promotion
    is_promoted         BOOLEAN NOT NULL DEFAULT false,
    promotion_tier      TEXT CHECK (promotion_tier IN ('standard', 'featured', 'premium')),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_event_times CHECK (end_time > start_time),
    CONSTRAINT valid_price_range CHECK (price_min IS NULL OR price_max IS NULL OR price_min <= price_max)
);

-- Spatial index for "events near me"
CREATE INDEX idx_events_location ON events USING GIST (location);

-- Events by date (upcoming events sorted by start_time)
CREATE INDEX idx_events_start_time ON events (start_time) WHERE status = 'published';

-- Events by popularity (home feed sorted by attending_count)
CREATE INDEX idx_events_popularity ON events (attending_count DESC) WHERE status = 'published';

-- Category filter
CREATE INDEX idx_events_category ON events (category) WHERE status = 'published';

-- Full-text search on title + description using GIN + tsvector
-- Supports both English and Chinese (simple config treats each character as a token)
CREATE INDEX idx_events_fts ON events USING GIN (
    (to_tsvector('simple', title) || to_tsvector('simple', description))
);

-- Organizer's events listing
CREATE INDEX idx_events_organizer ON events (organizer_id);

-- Promoted events (for ad placements)
CREATE INDEX idx_events_promoted ON events (promotion_tier) WHERE is_promoted = true AND status = 'published';

-- ============================================================
-- 7. TICKET TYPES
-- ============================================================
-- Each event can have multiple ticket tiers (e.g., early bird, VIP, general).
-- Prices in TWD → INTEGER.
CREATE TABLE ticket_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    price           INTEGER NOT NULL CHECK (price >= 0),
    currency        TEXT NOT NULL DEFAULT 'TWD',
    quantity        INTEGER NOT NULL CHECK (quantity >= 0),
    sold_count      INTEGER NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
    max_per_user    INTEGER NOT NULL DEFAULT 10 CHECK (max_per_user >= 1),
    sale_start      TIMESTAMPTZ NOT NULL,
    sale_end        TIMESTAMPTZ NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_sale_window CHECK (sale_end > sale_start),
    CONSTRAINT sold_within_quantity CHECK (sold_count <= quantity)
);

CREATE INDEX idx_ticket_types_event ON ticket_types (event_id);

-- ============================================================
-- 8. ORDERS
-- ============================================================
-- One order per purchase session. total_amount in TWD → INTEGER.
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    total_amount    INTEGER NOT NULL CHECK (total_amount >= 0),
    currency        TEXT NOT NULL DEFAULT 'TWD',
    payment_method  TEXT NOT NULL
                        CHECK (payment_method IN ('credit_card','apple_pay','google_pay','external')),
    payment_status  TEXT NOT NULL DEFAULT 'pending'
                        CHECK (payment_status IN ('pending','paid','failed','refunded')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders (user_id);
CREATE INDEX idx_orders_event ON orders (event_id);

-- ============================================================
-- 9. ORDER ITEMS
-- ============================================================
-- Line items within an order. Stores snapshot of ticket_type_name and unit_price
-- at purchase time (prices may change later).
CREATE TABLE order_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    ticket_type_id    UUID NOT NULL REFERENCES ticket_types(id) ON DELETE RESTRICT,
    ticket_type_name  TEXT NOT NULL,
    quantity          INTEGER NOT NULL CHECK (quantity >= 1),
    unit_price        INTEGER NOT NULL CHECK (unit_price >= 0),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items (order_id);

-- ============================================================
-- 10. TICKETS
-- ============================================================
-- Individual tickets issued after payment. Each has a unique QR code payload.
CREATE TABLE tickets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type_id  UUID NOT NULL REFERENCES ticket_types(id) ON DELETE RESTRICT,
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    qr_code         TEXT NOT NULL UNIQUE,
    status          TEXT NOT NULL DEFAULT 'valid'
                        CHECK (status IN ('valid','used','cancelled','refunded')),
    purchased_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    used_at         TIMESTAMPTZ
);

CREATE INDEX idx_tickets_user ON tickets (user_id);
CREATE INDEX idx_tickets_event ON tickets (event_id);
CREATE INDEX idx_tickets_order ON tickets (order_id);

-- ============================================================
-- 11. EVENT INTERACTIONS
-- ============================================================
-- Composite PK on (user_id, event_id) — one interaction per user per event.
-- type matches shared EventInteraction: attending | interested | want_to_go
CREATE TABLE event_interactions (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    type        TEXT NOT NULL
                    CHECK (type IN ('attending','interested','want_to_go')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, event_id)
);

-- "Who's going to this event?" query
CREATE INDEX idx_event_interactions_event ON event_interactions (event_id);

-- ============================================================
-- 12. FRIENDSHIPS
-- ============================================================
-- Directional: user_id sends request to friend_id.
-- UNIQUE constraint prevents duplicate requests in the same direction.
-- App logic should check both directions for existing friendships.
CREATE TABLE friendships (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','accepted','blocked')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT no_self_friendship CHECK (user_id <> friend_id),
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

CREATE INDEX idx_friendships_friend ON friendships (friend_id);
-- Find accepted friends for a user
CREATE INDEX idx_friendships_accepted ON friendships (user_id) WHERE status = 'accepted';

-- ============================================================
-- 13. COUPONS
-- ============================================================
-- Can be scoped to an event (event_id) or merchant-wide (event_id NULL).
-- discount_value: percentage (0-100) or fixed TWD amount.
CREATE TABLE coupons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
    merchant_id     UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE,
    code            TEXT NOT NULL UNIQUE,
    discount_type   TEXT NOT NULL
                        CHECK (discount_type IN ('percentage','fixed')),
    discount_value  INTEGER NOT NULL CHECK (discount_value > 0),
    max_uses        INTEGER NOT NULL CHECK (max_uses >= 0),
    used_count      INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    valid_from      TIMESTAMPTZ NOT NULL,
    valid_until     TIMESTAMPTZ NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_coupon_window CHECK (valid_until > valid_from),
    CONSTRAINT used_within_max CHECK (used_count <= max_uses)
);

CREATE INDEX idx_coupons_code ON coupons (code);
CREATE INDEX idx_coupons_merchant ON coupons (merchant_id);

-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================
-- Push notification log. data stored as JSONB for flexible payload (e.g., eventId).
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL
                    CHECK (type IN ('event_reminder','friend_going','hot_tonight','ticket_confirmed','promotion')),
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    data        JSONB DEFAULT '{}',
    is_read     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
-- Unread notifications badge count
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE is_read = false;

-- ============================================================
-- 15. PROMOTION PLACEMENTS
-- ============================================================
-- Tracks active promotion slots. Links an event to a purchased promotion tier
-- with a date range. Used to query which events to show in promoted slots.
CREATE TABLE promotion_placements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    merchant_id     UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE,
    tier            TEXT NOT NULL
                        CHECK (tier IN ('standard','featured','premium')),
    price_paid      INTEGER NOT NULL CHECK (price_paid >= 0),
    currency        TEXT NOT NULL DEFAULT 'TWD',
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_promotion_window CHECK (ends_at > starts_at)
);

CREATE INDEX idx_promotions_active ON promotion_placements (tier, starts_at, ends_at) WHERE is_active = true;
CREATE INDEX idx_promotions_event ON promotion_placements (event_id);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
