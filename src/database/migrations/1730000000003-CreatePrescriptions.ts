import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePrescriptions1730000000003 implements MigrationInterface {
  name = "CreatePrescriptions1730000000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "prescriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patient_name" character varying(255) NOT NULL,
        "patient_id" character varying(100),
        "appointment_id" uuid,
        "medication" character varying(255) NOT NULL,
        "dosage" character varying(255),
        "instructions" text,
        "prescribed_by" character varying(255) NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prescriptions_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "prescriptions"`);
  }
}
