import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoles1730000000004 implements MigrationInterface {
  name = "CreateRoles1730000000004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(50) NOT NULL,
        "display_name" character varying(255),
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "roles" ("name", "display_name") VALUES
        ('admin',          'Admin'),
        ('facility_admin', 'Facility Admin'),
        ('doctor',         'Doctor'),
        ('nurse',          'Nurse'),
        ('receptionist',   'Receptionist'),
        ('accountant',     'Accountant'),
        ('pharmacist',     'Pharmacist'),
        ('lab_tech',       'Lab Tech')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
