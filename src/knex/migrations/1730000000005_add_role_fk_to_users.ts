import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const [{ exists }] = await knex.raw(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'users' AND column_name = 'role_id'
    ) AS exists
  `).then((r: any) => r.rows);
  if (exists) return;

  await knex.raw(`ALTER TABLE "users" ADD COLUMN "role_id" uuid`);
  await knex.raw(`
    UPDATE "users"
    SET "role_id" = r."id"
    FROM "roles" r
    WHERE "users"."role" = r."name" AND "users"."role_id" IS NULL
  `);
  await knex.raw(`ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL`);

  const [{ has_role_col }] = await knex.raw(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'users' AND column_name = 'role'
    ) AS has_role_col
  `).then((r: any) => r.rows);
  if (has_role_col) {
    await knex.raw(`ALTER TABLE "users" DROP COLUMN "role"`);
  }

  await knex.raw(`
    ALTER TABLE "users"
    ADD CONSTRAINT "FK_users_role_id"
    FOREIGN KEY ("role_id") REFERENCES "roles"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_users_role_id" ON "users" ("role_id")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_users_role_id"`);
  await knex.raw(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_role_id"`);
  await knex.raw(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" varchar(50)`);
  await knex.raw(`
    UPDATE "users" SET "role" = r."name"
    FROM "roles" r WHERE "users"."role_id" = r."id"
  `);
  await knex.raw(`ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL`);
  await knex.raw(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role_id"`);
}
