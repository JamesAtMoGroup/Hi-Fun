import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.integer('total_amount').notNullable();
    table.text('currency').notNullable().defaultTo('TWD');
    table.text('payment_method').notNullable();
    table.text('payment_status').notNullable().defaultTo('pending');
    // coupon_id added as nullable UUID without FK — FK will be added in coupons migration
    table.uuid('coupon_id').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE orders
      ADD CONSTRAINT orders_total_amount_check CHECK (total_amount >= 0)
  `);
  await knex.raw(`
    ALTER TABLE orders
      ADD CONSTRAINT orders_payment_method_check
        CHECK (payment_method IN ('credit_card','apple_pay','google_pay','external'))
  `);
  await knex.raw(`
    ALTER TABLE orders
      ADD CONSTRAINT orders_payment_status_check
        CHECK (payment_status IN ('pending','paid','failed','refunded'))
  `);

  await knex.raw(`CREATE INDEX idx_orders_user ON orders (user_id)`);
  await knex.raw(`CREATE INDEX idx_orders_event ON orders (event_id)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('orders');
}
