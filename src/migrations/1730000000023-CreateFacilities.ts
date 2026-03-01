import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFacilities1730000000023 implements MigrationInterface {
  name = "CreateFacilities1730000000023";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "facilities" (
        "id"            uuid          NOT NULL DEFAULT gen_random_uuid(),
        "code"          varchar(20)   NOT NULL,
        "name"          varchar(255)  NOT NULL,
        "facility_type" varchar(50),
        "address"       text,
        "phone"         varchar(50),
        "email"         varchar(255),
        "district"      varchar(100),
        "region"        varchar(100),
        "description"   text,
        "is_active"     boolean       NOT NULL DEFAULT true,
        "deleted_at"    TIMESTAMP,
        "created_at"    TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_facilities_id"   PRIMARY KEY ("id"),
        CONSTRAINT "UQ_facilities_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_facilities_code"     ON "facilities" ("code")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_facilities_is_active" ON "facilities" ("is_active")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_facilities_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_facilities_code"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "facilities"`);
  }
}
