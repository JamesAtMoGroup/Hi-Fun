import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('title').notNullable();
    table.text('description').notNullable().defaultTo('');
    table.text('category').notNullable();
    table.text('status').notNullable().defaultTo('draft');

    // Denormalized venue fields
    table.text('venue_name').notNullable();
    table.text('address').notNullable();
    table.float('latitude', 8).notNullable();
    table.float('longitude', 8).notNullable();
    table.text('google_place_id');

    // Optional FK to normalized venues table
    table.uuid('venue_id').references('id').inTable('venues').onDelete('SET NULL');

    // Time
    table.timestamp('start_time', { useTz: true }).notNullable();
    table.timestamp('end_time', { useTz: true }).notNullable();
    table.text('timezone').notNullable().defaultTo('Asia/Taipei');

    // Media
    table.text('cover_image_url').notNullable();
    table.jsonb('image_urls').notNullable().defaultTo('[]');
    table.text('video_url');
    table.text('youtube_ad_url');

    // Pricing
    table.boolean('is_free').notNullable().defaultTo(false);
    table.integer('price_min');
    table.integer('price_max');
    table.text('currency').notNullable().defaultTo('TWD');
    table.text('external_ticket_url');

    // Popularity counters
    table.integer('attending_count').notNullable().defaultTo(0);
    table.integer('interested_count').notNullable().defaultTo(0);
    table.integer('view_count').notNullable().defaultTo(0);

    // Relations
    table.uuid('organizer_id').notNullable().references('id').inTable('merchant_profiles').onDelete('CASCADE');
    table.specificType('tags', 'TEXT[]').notNullable().defaultTo('{}');

    // Promotion
    table.boolean('is_promoted').notNullable().defaultTo(false);
    table.text('promotion_tier');

    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // Add PostGIS geography column
  await knex.raw(`
    ALTER TABLE events ADD COLUMN location GEOGRAPHY(Point, 4326) NOT NULL
  `);

  // CHECK constraints
  await knex.raw(`
    ALTER TABLE events
      ADD CONSTRAINT events_category_check CHECK (category IN (
        'nightclub','live_music','market','sports',
        'exhibition','food_drink','outdoor','workshop',
        'party','other'
      ))
  `);
  await knex.raw(`
    ALTER TABLE events
      ADD CONSTRAINT events_status_check CHECK (status IN ('draft','published','cancelled','ended'))
  `);
  await knex.raw(`
    ALTER TABLE events
      ADD CONSTRAINT events_promotion_tier_check CHECK (promotion_tier IN ('standard', 'featured', 'premium'))
  `);
  await knex.raw(`
    ALTER TABLE events
      ADD CONSTRAINT valid_event_times CHECK (end_time > start_time)
  `);
  await knex.raw(`
    ALTER TABLE events
      ADD CONSTRAINT valid_price_range CHECK (price_min IS NULL OR price_max IS NULL OR price_min <= price_max)
  `);

  // Indexes
  // Spatial index for "events near me"
  await knex.raw(`CREATE INDEX idx_events_location ON events USING GIST (location)`);

  // Events by date (upcoming events sorted by start_time)
  await knex.raw(`CREATE INDEX idx_events_start_time ON events (start_time) WHERE status = 'published'`);

  // Events by popularity (home feed sorted by attending_count)
  await knex.raw(`CREATE INDEX idx_events_popularity ON events (attending_count DESC) WHERE status = 'published'`);

  // Category filter
  await knex.raw(`CREATE INDEX idx_events_category ON events (category) WHERE status = 'published'`);

  // Full-text search on title + description using GIN + tsvector
  await knex.raw(`
    CREATE INDEX idx_events_fts ON events USING GIN (
      (to_tsvector('simple', title) || to_tsvector('simple', description))
    )
  `);

  // Organizer's events listing
  await knex.raw(`CREATE INDEX idx_events_organizer ON events (organizer_id)`);

  // Promoted events (for ad placements)
  await knex.raw(`CREATE INDEX idx_events_promoted ON events (promotion_tier) WHERE is_promoted = true AND status = 'published'`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('events');
}
