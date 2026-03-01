import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamePasswordHashColumn1730000000019 implements MigrationInterface {
  name = "RenamePasswordHashColumn1730000000019";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasOld = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'passwordHash'`
    );
    if (Array.isArray(hasOld) && hasOld.length > 0) {
      await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasNew = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash'`
    );
    if (Array.isArray(hasNew) && hasNew.length > 0) {
      await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "password_hash" TO "passwordHash"`);
    }
  }
}
