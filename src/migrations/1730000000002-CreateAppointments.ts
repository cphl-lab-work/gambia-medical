import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAppointments1730000000002 implements MigrationInterface {
  name = "CreateAppointments1730000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "appointments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patient_name" character varying(255) NOT NULL,
        "patient_id" character varying(100),
        "phone" character varying(50),
        "reason" character varying(500),
        "preferred_doctor" character varying(255),
        "status" character varying(50) NOT NULL,
        "appointment_fee" decimal(12,2) NOT NULL DEFAULT 0,
        "paid_at" TIMESTAMP,
        "allocated_doctor" character varying(255),
        "allocated_date" date,
        "allocated_time" character varying(10),
        "booked_by" character varying(100) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_appointments_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "appointments"`);
  }
}
