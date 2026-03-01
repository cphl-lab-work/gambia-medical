import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "encounters" (
      "id"                  uuid         NOT NULL DEFAULT gen_random_uuid(),
      "encounter_number"    varchar(50)  NOT NULL,
      "patient_id"          uuid         NOT NULL,
      "arrival_source"      varchar(50),
      "attending_doctor_id" uuid,
      "department_id"       uuid,
      "status"              varchar(30)  NOT NULL DEFAULT 'open',
      "chief_complaint"     text,
      "clinical_notes"      text,
      "diagnosis"           text,
      "treatment_plan"      text,
      "admitted_at"         TIMESTAMP,
      "discharged_at"       TIMESTAMP,
      "created_at"          TIMESTAMP    NOT NULL DEFAULT now(),
      "updated_at"          TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "PK_encounters_id"     PRIMARY KEY ("id"),
      CONSTRAINT "UQ_encounters_number" UNIQUE ("encounter_number"),
      CONSTRAINT "FK_encounters_patient"
        FOREIGN KEY ("patient_id") REFERENCES "patients"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "FK_encounters_doctor"
        FOREIGN KEY ("attending_doctor_id") REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT "FK_encounters_department"
        FOREIGN KEY ("department_id") REFERENCES "departments"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_encounters_patient_id" ON "encounters" ("patient_id")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_encounters_status" ON "encounters" ("status")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_encounters_status"`);
  await knex.raw(`DROP INDEX IF EXISTS "IDX_encounters_patient_id"`);
  await knex.raw(`DROP TABLE IF EXISTS "encounters"`);
}
