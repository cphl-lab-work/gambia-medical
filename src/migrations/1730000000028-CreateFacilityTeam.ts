import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFacilityTeam1730000000028 implements MigrationInterface {
  name = "CreateFacilityTeam1730000000028";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "facility_team" (
        "id"              uuid          NOT NULL DEFAULT gen_random_uuid(),
        "staff_id"        uuid          NOT NULL,
        "facility_id"     uuid          NOT NULL,
        "status"          varchar(50)   NOT NULL DEFAULT 'active',
        "details"         text,
        "deleted_at"      TIMESTAMP,
        "created_at"      TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_facility_team_id"                  PRIMARY KEY ("id"),
        CONSTRAINT "FK_facility_team_staff_id"            FOREIGN KEY ("staff_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_facility_team_facility_id"         FOREIGN KEY ("facility_id") REFERENCES "facilities" ("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_facility_team_staff_facility"      UNIQUE ("staff_id", "facility_id") WHERE "deleted_at" IS NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_facility_team_staff_id"     ON "facility_team" ("staff_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_facility_team_facility_id"   ON "facility_team" ("facility_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_facility_team_status"        ON "facility_team" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_facility_team_deleted_at"    ON "facility_team" ("deleted_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_facility_team_deleted_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_facility_team_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_facility_team_facility_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_facility_team_staff_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "facility_team"`);
  }
}
