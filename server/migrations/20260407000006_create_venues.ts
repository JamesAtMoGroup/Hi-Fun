import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('venues', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name').notNullable();
    table.text('address').notNullable();
    table.float('latitude', 8).notNullable();
    table.float('longitude', 8).notNullable();
    table.text('google_place_id');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // Add PostGIS geography column
  await knex.raw(`
    ALTER TABLE venues ADD COLUMN location GEOGRAPHY(Point, 4326) NOT NULL
  `);

  // Spatial index for radius queries (ST_DWithin)
  await knex.raw(`
    CREATE INDEX idx_venues_location ON venues USING GIST (location)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('venues');
}
