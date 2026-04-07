import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('coupons', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('event_id').references('id').inTable('events').onDelete('CASCADE');
    table.uuid('merchant_id').notNullable().references('id').inTable('merchant_profiles').onDelete('CASCADE');
    table.text('code').notNullable().unique();
    table.text('discount_type').notNullable();
    table.integer('discount_value').notNullable();
    table.integer('max_uses').notNullable();
    table.integer('used_count').notNullable().defaultTo(0);
    table.timestamp('valid_from', { useTz: true }).notNullable();
    table.timestamp('valid_until', { useTz: true }).notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE coupons
      ADD CONSTRAINT coupons_discount_type_check CHECK (discount_type IN ('percentage','fixed'))
  `);
  await knex.raw(`ALTER TABLE coupons ADD CONSTRAINT coupons_discount_value_check CHECK (discount_value > 0)`);
  await knex.raw(`ALTER TABLE coupons ADD CONSTRAINT coupons_max_uses_check CHECK (max_uses >= 0)`);
  await knex.raw(`ALTER TABLE coupons ADD CONSTRAINT coupons_used_count_check CHECK (used_count >= 0)`);
  await knex.raw(`ALTER TABLE coupons ADD CONSTRAINT valid_coupon_window CHECK (valid_until > valid_from)`);
  await knex.raw(`ALTER TABLE coupons ADD CONSTRAINT used_within_max CHECK (used_count <= max_uses)`);

  await knex.raw(`CREATE INDEX idx_coupons_code ON coupons (code)`);
  await knex.raw(`CREATE INDEX idx_coupons_merchant ON coupons (merchant_id)`);

  // Now add the FK from orders.coupon_id to coupons.id
  await knex.raw(`
    ALTER TABLE orders
      ADD CONSTRAINT orders_coupon_id_foreign
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Remove the FK from orders first
  await knex.raw(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_coupon_id_foreign`);
  await knex.schema.dropTableIfExists('coupons');
}
