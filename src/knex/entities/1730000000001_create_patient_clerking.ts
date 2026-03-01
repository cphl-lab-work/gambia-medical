import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.schema.createTable('patient_clerking', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('patient_name', 255).notNullable();
    table.string('patient_id', 100);
    table.string('arrival_source', 50).notNullable();
    table.date('date_of_arrival').notNullable();
    table.string('time_of_arrival', 10).notNullable();
    table.string('status', 50).notNullable();
    table.string('phone', 50);
    table.string('gender', 20);
    table.date('date_of_birth');
    table.string('recorded_by', 50).notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('patient_clerking');
}
