import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tickets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('ticket_type_id').notNullable().references('id').inTable('ticket_types').onDelete('RESTRICT');
    table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.text('qr_code').notNullable().unique();
    table.text('status').notNullable().defaultTo('valid');
    table.timestamp('purchased_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('used_at', { useTz: true });
  });

  await knex.raw(`
    ALTER TABLE tickets
      ADD CONSTRAINT tickets_status_check CHECK (status IN ('valid','used','cancelled','refunded'))
  `);

  await knex.raw(`CREATE INDEX idx_tickets_user ON tickets (user_id)`);
  await knex.raw(`CREATE INDEX idx_tickets_event ON tickets (event_id)`);
  await knex.raw(`CREATE INDEX idx_tickets_order ON tickets (order_id)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tickets');
}
