import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployees1730000000017 implements MigrationInterface {
  name = "CreateEmployees1730000000017";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "employees" (
        "id"                       uuid          NOT NULL DEFAULT gen_random_uuid(),
        "employee_code"            varchar(20)   NOT NULL,
        "first_name"               varchar(100)  NOT NULL,
        "last_name"                varchar(100)  NOT NULL,
        "gender"                   varchar(20),
        "date_of_birth"            date,
        "phone"                    varchar(50),
        "email"                    varchar(255),
        "national_id"              varchar(100),
        "address"                  text,
        "facility"                 varchar(255),
        "department_id"            uuid,
        "job_title"                varchar(100),
        "specialisation"           varchar(100),
        "employment_type"          varchar(50),
        "date_joined"              date,
        "license_number"           varchar(100),
        "emergency_contact_name"   varchar(255),
        "emergency_contact_phone"  varchar(50),
        "user_id"                  uuid,
        "status"                   varchar(20)   NOT NULL DEFAULT 'active',
        "deleted_at"               TIMESTAMP,
        "created_at"               TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"               TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_employees_id"   PRIMARY KEY ("id"),
        CONSTRAINT "UQ_employees_code" UNIQUE ("employee_code"),
        CONSTRAINT "FK_employees_department"
          FOREIGN KEY ("department_id") REFERENCES "departments"("id")
          ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "FK_employees_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id")
          ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_employees_department_id" ON "employees" ("department_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_employees_user_id"       ON "employees" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_employees_status"        ON "employees" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_employees_facility"      ON "employees" ("facility")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_employees_facility"`);
    await queryRunner.query(`DROP INDEX "IDX_employees_status"`);
    await queryRunner.query(`DROP INDEX "IDX_employees_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_employees_department_id"`);
    await queryRunner.query(`DROP TABLE "employees"`);
  }
}
