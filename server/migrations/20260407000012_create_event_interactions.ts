import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('event_interactions', (table) => {
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.text('type').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.primary(['user_id', 'event_id']);
  });

  await knex.raw(`
    ALTER TABLE event_interactions
      ADD CONSTRAINT event_interactions_type_check CHECK (type IN ('attending','interested','want_to_go'))
  `);

  await knex.raw(`CREATE INDEX idx_event_interactions_event ON event_interactions (event_id)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('event_interactions');
}
