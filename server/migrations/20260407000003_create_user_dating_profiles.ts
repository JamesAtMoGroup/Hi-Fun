import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_dating_profiles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.text('gender').notNullable();
    table.text('dating_role').notNullable();
    table.specificType('interested_in_genders', 'TEXT[]').notNullable().defaultTo('{}');
    table.specificType('interested_in_roles', 'TEXT[]').notNullable().defaultTo('{}');
    table.boolean('show_on_dating').notNullable().defaultTo(false);
    table.text('dating_bio');
    table.integer('age');
    table.jsonb('photos').notNullable().defaultTo('[]');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE user_dating_profiles
      ADD CONSTRAINT user_dating_profiles_gender_check
        CHECK (gender IN ('male', 'female', 'non_binary', 'other'))
  `);
  await knex.raw(`
    ALTER TABLE user_dating_profiles
      ADD CONSTRAINT user_dating_profiles_dating_role_check
        CHECK (dating_role IN ('top', 'bottom', 'vers', 'vers_top', 'vers_bottom', 'side', 'other'))
  `);
  await knex.raw(`
    ALTER TABLE user_dating_profiles
      ADD CONSTRAINT user_dating_profiles_age_check
        CHECK (age >= 18 AND age <= 120)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_dating_profiles');
}
