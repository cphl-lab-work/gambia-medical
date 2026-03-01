import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone"        varchar(50)`);
  await knex.raw(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status"       varchar(20) NOT NULL DEFAULT 'active'`);
  await knex.raw(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activated_at" TIMESTAMP`);
  await knex.raw(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at"   TIMESTAMP`);
  await knex.raw(`UPDATE "users" SET "activated_at" = "created_at" WHERE "activated_at" IS NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE "users"
      DROP COLUMN IF EXISTS "deleted_at",
      DROP COLUMN IF EXISTS "activated_at",
      DROP COLUMN IF EXISTS "status",
      DROP COLUMN IF EXISTS "phone"
  `);
}
