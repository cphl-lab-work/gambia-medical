import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "prescriptions" (
      "id"             uuid         NOT NULL DEFAULT uuid_generate_v4(),
      "patient_name"   varchar(255) NOT NULL,
      "patient_id"     varchar(100),
      "appointment_id" uuid,
      "medication"     varchar(255) NOT NULL,
      "dosage"         varchar(255),
      "instructions"   text,
      "prescribed_by"  varchar(255) NOT NULL,
      "status"         varchar(50)  NOT NULL DEFAULT 'pending',
      "created_at"     TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "PK_prescriptions_id" PRIMARY KEY ("id")
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE IF EXISTS "prescriptions"');
}
