import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "doctors" (
      "id"         uuid      NOT NULL DEFAULT gen_random_uuid(),
      "staff_id"   uuid      NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_doctors_id"       PRIMARY KEY ("id"),
      CONSTRAINT "UQ_doctors_staff_id" UNIQUE ("staff_id"),
      CONSTRAINT "FK_doctors_staff"
        FOREIGN KEY ("staff_id") REFERENCES "employees"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_doctors_staff_id" ON "doctors" ("staff_id")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_doctors_staff_id"`);
  await knex.raw(`DROP TABLE IF EXISTS "doctors"`);
}
