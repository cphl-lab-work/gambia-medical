import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.schema.createTable('appointments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('patient_name', 255).notNullable();
    table.string('patient_id', 100);
    table.string('phone', 50);
    table.string('reason', 500);
    table.string('preferred_doctor', 255);
    table.string('status', 50).notNullable();
    table.decimal('appointment_fee', 12, 2).notNullable().defaultTo(0);
    table.timestamp('paid_at');
    table.string('allocated_doctor', 255);
    table.date('allocated_date');
    table.string('allocated_time', 10);
    table.string('booked_by', 100).notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('appointments');
}
