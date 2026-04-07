import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('merchant_profiles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.text('business_name').notNullable();
    table.text('business_type').notNullable();
    table.text('logo_url');
    table.text('description');
    table.text('contact_email').notNullable();
    table.text('contact_phone');
    table.text('address');
    table.decimal('google_rating', 2, 1);
    table.boolean('is_verified').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE merchant_profiles
      ADD CONSTRAINT merchant_profiles_business_type_check
        CHECK (business_type IN ('venue', 'organizer', 'brand'))
  `);
  await knex.raw(`
    ALTER TABLE merchant_profiles
      ADD CONSTRAINT merchant_profiles_google_rating_check
        CHECK (google_rating >= 0 AND google_rating <= 5)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('merchant_profiles');
}
