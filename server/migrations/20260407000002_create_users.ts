import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('email').notNullable().unique();
    table.text('password_hash').notNullable();
    table.text('display_name').notNullable();
    table.text('avatar_url');
    table.text('bio');
    table.text('role').notNullable().defaultTo('user');
    table.text('expo_push_token');
    table.text('locale').notNullable().defaultTo('zh-TW');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE users
      ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'merchant', 'admin'))
  `);
  await knex.raw(`
    ALTER TABLE users
      ADD CONSTRAINT users_locale_check CHECK (locale IN ('zh-TW', 'en'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
