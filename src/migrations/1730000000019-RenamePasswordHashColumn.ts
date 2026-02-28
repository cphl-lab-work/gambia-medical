import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamePasswordHashColumn1730000000019 implements MigrationInterface {
  name = "RenamePasswordHashColumn1730000000019";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" RENAME COLUMN "password_hash" TO "passwordHash"
    `);
  }
}
