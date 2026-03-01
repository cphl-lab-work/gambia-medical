import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "code"           varchar(20)`);
  await knex.raw(`ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "permissions"    text`);
  await knex.raw(`ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "is_system_role" boolean NOT NULL DEFAULT false`);
  await knex.raw(`ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "status"         varchar(20) NOT NULL DEFAULT 'active'`);
  await knex.raw(`ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "deleted_at"     TIMESTAMP`);

  await knex.raw(`
    UPDATE "roles"
    SET "is_system_role" = true,
        "code" = COALESCE("code", UPPER("name"))
    WHERE "is_system_role" = false OR "code" IS NULL
  `);

  await knex.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_roles_code') THEN
        ALTER TABLE "roles" ADD CONSTRAINT "UQ_roles_code" UNIQUE ("code");
      END IF;
    END $$
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_roles_status" ON "roles" ("status")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_roles_status"`);
  await knex.raw(`ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "UQ_roles_code"`);
  await knex.raw(`
    ALTER TABLE "roles"
      DROP COLUMN IF EXISTS "deleted_at",
      DROP COLUMN IF EXISTS "status",
      DROP COLUMN IF EXISTS "is_system_role",
      DROP COLUMN IF EXISTS "permissions",
      DROP COLUMN IF EXISTS "code"
  `);
}
