import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "facility_team" (
      "id"          uuid         NOT NULL DEFAULT gen_random_uuid(),
      "staff_id"    uuid         NOT NULL,
      "facility_id" uuid         NOT NULL,
      "status"      varchar(50)  NOT NULL DEFAULT 'active',
      "details"     text,
      "deleted_at"  TIMESTAMP,
      "created_at"  TIMESTAMP    NOT NULL DEFAULT now(),
      "updated_at"  TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "PK_facility_team_id"         PRIMARY KEY ("id"),
      CONSTRAINT "FK_facility_team_staff_id"    FOREIGN KEY ("staff_id")    REFERENCES "users"("id")      ON DELETE CASCADE,
      CONSTRAINT "FK_facility_team_facility_id" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE
    )
  `);
  // Partial unique index (can't be inline CONSTRAINT in CREATE TABLE)
  await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS "UQ_facility_team_staff_facility"
    ON "facility_team" ("staff_id", "facility_id")
    WHERE "deleted_at" IS NULL
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_facility_team_staff_id"    ON "facility_team" ("staff_id")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_facility_team_facility_id" ON "facility_team" ("facility_id")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_facility_team_status"      ON "facility_team" ("status")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_facility_team_deleted_at"  ON "facility_team" ("deleted_at")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_facility_team_deleted_at"`);
  await knex.raw(`DROP INDEX IF EXISTS "IDX_facility_team_status"`);
  await knex.raw(`DROP INDEX IF EXISTS "IDX_facility_team_facility_id"`);
  await knex.raw(`DROP INDEX IF EXISTS "IDX_facility_team_staff_id"`);
  await knex.raw(`DROP TABLE IF EXISTS "facility_team"`);
}
