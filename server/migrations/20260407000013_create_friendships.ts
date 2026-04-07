import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('friendships', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('friend_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('status').notNullable().defaultTo('pending');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.unique(['user_id', 'friend_id']);
  });

  await knex.raw(`
    ALTER TABLE friendships
      ADD CONSTRAINT friendships_status_check CHECK (status IN ('pending','accepted','blocked'))
  `);
  await knex.raw(`
    ALTER TABLE friendships
      ADD CONSTRAINT no_self_friendship CHECK (user_id <> friend_id)
  `);

  await knex.raw(`CREATE INDEX idx_friendships_friend ON friendships (friend_id)`);
  await knex.raw(`CREATE INDEX idx_friendships_accepted ON friendships (user_id) WHERE status = 'accepted'`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('friendships');
}
