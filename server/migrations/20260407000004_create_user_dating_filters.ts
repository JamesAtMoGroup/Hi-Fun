import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_dating_filters', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.specificType('gender_filter', 'TEXT[]').notNullable().defaultTo('{}');
    table.specificType('role_filter', 'TEXT[]').notNullable().defaultTo('{}');
    table.integer('age_range_min').notNullable().defaultTo(18);
    table.integer('age_range_max').notNullable().defaultTo(99);
    table.integer('max_distance').notNullable().defaultTo(50);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE user_dating_filters
      ADD CONSTRAINT user_dating_filters_age_range_min_check CHECK (age_range_min >= 18)
  `);
  await knex.raw(`
    ALTER TABLE user_dating_filters
      ADD CONSTRAINT user_dating_filters_age_range_max_check CHECK (age_range_max <= 120)
  `);
  await knex.raw(`
    ALTER TABLE user_dating_filters
      ADD CONSTRAINT valid_age_range CHECK (age_range_min <= age_range_max)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_dating_filters');
}
