import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneStatusDatesToUsers1730000000016 implements MigrationInterface {
  name = "AddPhoneStatusDatesToUsers1730000000016";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(50)`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'active'`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activated_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);

    await queryRunner.query(`
      UPDATE "users" SET "activated_at" = "created_at" WHERE "activated_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "deleted_at",
        DROP COLUMN IF EXISTS "activated_at",
        DROP COLUMN IF EXISTS "status",
        DROP COLUMN IF EXISTS "phone"
    `);
  }
}
