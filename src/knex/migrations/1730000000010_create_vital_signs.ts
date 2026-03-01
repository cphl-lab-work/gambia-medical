import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "vital_signs" (
      "id"               uuid          NOT NULL DEFAULT gen_random_uuid(),
      "encounter_id"     uuid          NOT NULL,
      "weight"           decimal(5,2),
      "height"           decimal(5,2),
      "temperature"      decimal(4,1),
      "bp_systolic"      integer,
      "bp_diastolic"     integer,
      "pulse"            integer,
      "respiratory_rate" integer,
      "spo2"             decimal(5,2),
      "pain_score"       integer,
      "triage_category"  varchar(20),
      "notes"            text,
      "recorded_by"      uuid,
      "created_at"       TIMESTAMP     NOT NULL DEFAULT now(),
      CONSTRAINT "PK_vital_signs_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_vital_signs_encounter"
        FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "FK_vital_signs_recorded_by"
        FOREIGN KEY ("recorded_by") REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_vital_signs_encounter_id" ON "vital_signs" ("encounter_id")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_vital_signs_encounter_id"`);
  await knex.raw(`DROP TABLE IF EXISTS "vital_signs"`);
}
