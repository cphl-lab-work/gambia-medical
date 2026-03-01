import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "patient_clerking" (
      "id"              uuid         NOT NULL DEFAULT uuid_generate_v4(),
      "patient_name"    varchar(255) NOT NULL,
      "patient_id"      varchar(100),
      "arrival_source"  varchar(50)  NOT NULL,
      "date_of_arrival" date         NOT NULL,
      "time_of_arrival" varchar(10)  NOT NULL,
      "status"          varchar(50)  NOT NULL,
      "phone"           varchar(50),
      "gender"          varchar(20),
      "date_of_birth"   date,
      "recorded_by"     varchar(50)  NOT NULL,
      "created_at"      TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "PK_patient_clerking_id" PRIMARY KEY ("id")
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE IF EXISTS "patient_clerking"');
}
