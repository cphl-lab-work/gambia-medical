import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "facilities" ADD COLUMN IF NOT EXISTS "facility_admin_id" uuid`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_facilities_facility_admin_id" ON "facilities" ("facility_admin_id")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_facilities_facility_admin_id"`);
  await knex.raw(`ALTER TABLE "facilities" DROP COLUMN IF EXISTS "facility_admin_id"`);
}
