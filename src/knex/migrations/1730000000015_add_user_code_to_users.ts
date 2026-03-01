import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "user_code" varchar(64)`);
  await knex.raw(`
    UPDATE "users"
    SET "user_code" = replace(gen_random_uuid()::text, '-', '')
    WHERE "user_code" IS NULL
  `);
  await knex.raw(`
    ALTER TABLE "users"
    ALTER COLUMN "user_code" SET NOT NULL,
    ALTER COLUMN "user_code" SET DEFAULT replace(gen_random_uuid()::text, '-', '')
  `);
  await knex.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_users_user_code') THEN
        ALTER TABLE "users" ADD CONSTRAINT "UQ_users_user_code" UNIQUE ("user_code");
      END IF;
    END $$
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_user_code"`);
  await knex.raw(`ALTER TABLE "users" DROP COLUMN IF EXISTS "user_code"`);
}
