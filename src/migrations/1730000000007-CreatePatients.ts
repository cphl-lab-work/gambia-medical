import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePatients1730000000007 implements MigrationInterface {
  name = "CreatePatients1730000000007";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patients" (
        "id"                      uuid          NOT NULL DEFAULT gen_random_uuid(),
        "uhid"                    varchar(50)   NOT NULL,
        "name"                    varchar(255)  NOT NULL,
        "age"                     integer,
        "date_of_birth"           date,
        "gender"                  varchar(20),
        "phone"                   varchar(50),
        "email"                   varchar(255),
        "address"                 text,
        "country_code"            varchar(10),
        "district"                varchar(100),
        "next_of_kin"             varchar(255),
        "next_of_kin_phone"       varchar(50),
        "next_of_kin_relationship" varchar(50),
        "insurance_type"          varchar(50)   NOT NULL DEFAULT 'self-pay',
        "insurance_policy"        varchar(255),
        "is_active"               boolean       NOT NULL DEFAULT true,
        "created_at"              TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"              TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patients_id"   PRIMARY KEY ("id"),
        CONSTRAINT "UQ_patients_uhid" UNIQUE ("uhid")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "patients"`);
  }
}
