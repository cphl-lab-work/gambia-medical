import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePatientClerking1730000000001 implements MigrationInterface {
  name = "CreatePatientClerking1730000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "patient_clerking" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patient_name" character varying(255) NOT NULL,
        "patient_id" character varying(100),
        "arrival_source" character varying(50) NOT NULL,
        "date_of_arrival" date NOT NULL,
        "time_of_arrival" character varying(10) NOT NULL,
        "status" character varying(50) NOT NULL,
        "phone" character varying(50),
        "gender" character varying(20),
        "date_of_birth" date,
        "recorded_by" character varying(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patient_clerking_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "patient_clerking"`);
  }
}
