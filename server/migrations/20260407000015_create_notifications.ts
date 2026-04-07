import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('type').notNullable();
    table.text('title').notNullable();
    table.text('body').notNullable();
    table.jsonb('data').defaultTo('{}');
    table.boolean('is_read').notNullable().defaultTo(false);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_type_check
        CHECK (type IN ('event_reminder','friend_going','hot_tonight','ticket_confirmed','promotion'))
  `);

  await knex.raw(`CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC)`);
  await knex.raw(`CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE is_read = false`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notifications');
}
