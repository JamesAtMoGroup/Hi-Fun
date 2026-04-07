import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('order_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.uuid('ticket_type_id').notNullable().references('id').inTable('ticket_types').onDelete('RESTRICT');
    table.text('ticket_type_name').notNullable();
    table.integer('quantity').notNullable();
    table.integer('unit_price').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_check CHECK (quantity >= 1)`);
  await knex.raw(`ALTER TABLE order_items ADD CONSTRAINT order_items_unit_price_check CHECK (unit_price >= 0)`);

  await knex.raw(`CREATE INDEX idx_order_items_order ON order_items (order_id)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_items');
}
