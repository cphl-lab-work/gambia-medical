import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneStatusDatesToUsers1730000000016 implements MigrationInterface {
  name = "AddPhoneStatusDatesToUsers1730000000016";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "phone"        varchar(50),
        ADD COLUMN "status"       varchar(20) NOT NULL DEFAULT 'active',
        ADD COLUMN "activated_at" TIMESTAMP,
        ADD COLUMN "deleted_at"   TIMESTAMP
    `);

    await queryRunner.query(`
      UPDATE "users" SET "activated_at" = "created_at" WHERE "activated_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN "deleted_at",
        DROP COLUMN "activated_at",
        DROP COLUMN "status",
        DROP COLUMN "phone"
    `);
  }
}
