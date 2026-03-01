import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDepartments1730000000008 implements MigrationInterface {
  name = "CreateDepartments1730000000008";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "departments" (
        "id"                      uuid          NOT NULL DEFAULT gen_random_uuid(),
        "name"                    varchar(100)  NOT NULL,
        "code"                    varchar(20),
        "description"             text,
        "head_of_department_id"   uuid,
        "is_active"               boolean       NOT NULL DEFAULT true,
        "created_at"              TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"              TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_departments_id"   PRIMARY KEY ("id"),
        CONSTRAINT "UQ_departments_name" UNIQUE ("name"),
        CONSTRAINT "FK_departments_hod"
          FOREIGN KEY ("head_of_department_id") REFERENCES "users"("id")
          ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`
      INSERT INTO "departments" ("name", "code") VALUES
        ('Outpatient (OPD)',          'OPD'),
        ('Emergency',                 'ER'),
        ('Inpatient',                 'IPD'),
        ('Laboratory',                'LAB'),
        ('Pharmacy',                  'PHAR'),
        ('Radiology / Imaging',       'RAD'),
        ('Surgery',                   'SURG'),
        ('Obstetrics & Gynaecology',  'OBGY'),
        ('Paediatrics',               'PAED'),
        ('Administration',            'ADMIN')
      ON CONFLICT ("name") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "departments"`);
  }
}
