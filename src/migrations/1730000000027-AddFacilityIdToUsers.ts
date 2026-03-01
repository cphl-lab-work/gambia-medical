import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFacilityIdToUsers1730000000027 implements MigrationInterface {
  name = "AddFacilityIdToUsers1730000000027";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "facility_id" uuid
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "users"."facility_id" IS 'UUID of the facility this user belongs to'
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_facility_id" 
      ON "users" ("facility_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_facility_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "facility_id"
    `);
  }
}
