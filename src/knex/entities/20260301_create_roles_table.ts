import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary();
    table.string('name', 50).unique().notNullable();
    table.string('code', 20).unique().nullable().comment('Uppercase short code e.g. ADMIN, DOCTOR');
    table.string('display_name', 255).nullable();
    table.text('description').nullable();
    table.text('permissions').nullable().comment('JSON array of permission strings');
    table.boolean('is_system_role').defaultTo(false).comment('System roles cannot be deleted');
    table.string('status', 20).defaultTo('active');
    table.timestamp('deleted_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('roles');
}
