import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ticket_types', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.text('name').notNullable();
    table.integer('price').notNullable();
    table.text('currency').notNullable().defaultTo('TWD');
    table.integer('quantity').notNullable();
    table.integer('sold_count').notNullable().defaultTo(0);
    table.integer('max_per_user').notNullable().defaultTo(10);
    table.timestamp('sale_start', { useTz: true }).notNullable();
    table.timestamp('sale_end', { useTz: true }).notNullable();
    table.text('description');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`ALTER TABLE ticket_types ADD CONSTRAINT ticket_types_price_check CHECK (price >= 0)`);
  await knex.raw(`ALTER TABLE ticket_types ADD CONSTRAINT ticket_types_quantity_check CHECK (quantity >= 0)`);
  await knex.raw(`ALTER TABLE ticket_types ADD CONSTRAINT ticket_types_sold_count_check CHECK (sold_count >= 0)`);
  await knex.raw(`ALTER TABLE ticket_types ADD CONSTRAINT ticket_types_max_per_user_check CHECK (max_per_user >= 1)`);
  await knex.raw(`ALTER TABLE ticket_types ADD CONSTRAINT valid_sale_window CHECK (sale_end > sale_start)`);
  await knex.raw(`ALTER TABLE ticket_types ADD CONSTRAINT sold_within_quantity CHECK (sold_count <= quantity)`);

  await knex.raw(`CREATE INDEX idx_ticket_types_event ON ticket_types (event_id)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ticket_types');
}
