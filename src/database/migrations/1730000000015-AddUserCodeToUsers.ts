import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserCodeToUsers1730000000015 implements MigrationInterface {
  name = "AddUserCodeToUsers1730000000015";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "user_code" varchar(64) UNIQUE
    `);

    // Back-fill existing rows with a random hex code derived from gen_random_uuid
    await queryRunner.query(`
      UPDATE "users"
      SET "user_code" = replace(gen_random_uuid()::text, '-', '')
      WHERE "user_code" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "user_code" SET NOT NULL,
      ALTER COLUMN "user_code" SET DEFAULT replace(gen_random_uuid()::text, '-', '')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_code"`);
  }
}
