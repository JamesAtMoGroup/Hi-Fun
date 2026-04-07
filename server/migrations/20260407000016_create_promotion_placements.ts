import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('promotion_placements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.uuid('merchant_id').notNullable().references('id').inTable('merchant_profiles').onDelete('CASCADE');
    table.text('tier').notNullable();
    table.integer('price_paid').notNullable();
    table.text('currency').notNullable().defaultTo('TWD');
    table.timestamp('starts_at', { useTz: true }).notNullable();
    table.timestamp('ends_at', { useTz: true }).notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE promotion_placements
      ADD CONSTRAINT promotion_placements_tier_check CHECK (tier IN ('standard','featured','premium'))
  `);
  await knex.raw(`
    ALTER TABLE promotion_placements
      ADD CONSTRAINT promotion_placements_price_paid_check CHECK (price_paid >= 0)
  `);
  await knex.raw(`
    ALTER TABLE promotion_placements
      ADD CONSTRAINT valid_promotion_window CHECK (ends_at > starts_at)
  `);

  await knex.raw(`CREATE INDEX idx_promotions_active ON promotion_placements (tier, starts_at, ends_at) WHERE is_active = true`);
  await knex.raw(`CREATE INDEX idx_promotions_event ON promotion_placements (event_id)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('promotion_placements');
}
