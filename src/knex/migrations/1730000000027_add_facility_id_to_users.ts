import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "facility_id" uuid`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_users_facility_id" ON "users" ("facility_id")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_users_facility_id"`);
  await knex.raw(`ALTER TABLE "users" DROP COLUMN IF EXISTS "facility_id"`);
}
