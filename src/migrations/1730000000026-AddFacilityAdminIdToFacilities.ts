import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFacilityAdminIdToFacilities1730000000026 implements MigrationInterface {
  name = "AddFacilityAdminIdToFacilities1730000000026";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "facilities"
      ADD COLUMN "facility_admin_id" uuid
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "facilities"."facility_admin_id" IS 'UUID of the facility admin user'
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_facilities_facility_admin_id" 
      ON "facilities" ("facility_admin_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_facilities_facility_admin_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "facilities"
      DROP COLUMN IF EXISTS "facility_admin_id"
    `);
  }
}
