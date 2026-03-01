import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const [{ has_old }] = await knex.raw(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'users' AND column_name = 'passwordHash'
    ) AS has_old
  `).then((r: any) => r.rows);
  if (has_old) {
    await knex.raw(`ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash"`);
  }
}

export async function down(knex: Knex): Promise<void> {
  const [{ has_new }] = await knex.raw(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'users' AND column_name = 'password_hash'
    ) AS has_new
  `).then((r: any) => r.rows);
  if (has_new) {
    await knex.raw(`ALTER TABLE "users" RENAME COLUMN "password_hash" TO "passwordHash"`);
  }
}
