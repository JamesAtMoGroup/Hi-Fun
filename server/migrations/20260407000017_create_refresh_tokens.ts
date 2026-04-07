import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('token').notNullable().unique();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.boolean('is_revoked').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // Index for token lookup during refresh
  await knex.raw(
    'CREATE INDEX idx_refresh_tokens_token ON refresh_tokens (token) WHERE is_revoked = false'
  );

  // Index for cleanup of expired/revoked tokens
  await knex.raw(
    'CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id)'
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('refresh_tokens');
}
