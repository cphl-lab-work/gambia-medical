import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "appointments" (
      "id"               uuid           NOT NULL DEFAULT uuid_generate_v4(),
      "patient_name"     varchar(255)   NOT NULL,
      "patient_id"       varchar(100),
      "phone"            varchar(50),
      "reason"           varchar(500),
      "preferred_doctor" varchar(255),
      "status"           varchar(50)    NOT NULL,
      "appointment_fee"  decimal(12,2)  NOT NULL DEFAULT 0,
      "paid_at"          TIMESTAMP,
      "allocated_doctor" varchar(255),
      "allocated_date"   date,
      "allocated_time"   varchar(10),
      "booked_by"        varchar(100)   NOT NULL,
      "created_at"       TIMESTAMP      NOT NULL DEFAULT now(),
      CONSTRAINT "PK_appointments_id" PRIMARY KEY ("id")
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE IF EXISTS "appointments"');
}
