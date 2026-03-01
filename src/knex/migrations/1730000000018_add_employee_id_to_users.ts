import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "employee_id" uuid`);
  await knex.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_users_employee_id') THEN
        ALTER TABLE "users" ADD CONSTRAINT "UQ_users_employee_id" UNIQUE ("employee_id");
      END IF;
    END $$
  `);
  await knex.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_users_employee_id') THEN
        ALTER TABLE "users"
        ADD CONSTRAINT "FK_users_employee_id"
        FOREIGN KEY ("employee_id") REFERENCES "employees"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$
  `);
  await knex.raw(`ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "FK_employees_user"`);
  await knex.raw(`DROP INDEX IF EXISTS "IDX_employees_user_id"`);
  await knex.raw(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "user_id"`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_employee_id"`);
  await knex.raw(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_employee_id"`);
  await knex.raw(`ALTER TABLE "users" DROP COLUMN IF EXISTS "employee_id"`);
  await knex.raw(`ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "user_id" uuid`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_employees_user_id" ON "employees" ("user_id")`);
}
