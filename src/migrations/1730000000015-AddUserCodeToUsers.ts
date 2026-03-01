import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserCodeToUsers1730000000015 implements MigrationInterface {
  name = "AddUserCodeToUsers1730000000015";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasCol = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'user_code'`
    );
    if (Array.isArray(hasCol) && hasCol.length > 0) return;

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "user_code" varchar(64)`);

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

    const hasUq = await queryRunner.query(`SELECT 1 FROM pg_constraint WHERE conname = 'UQ_users_user_code'`);
    if (!(Array.isArray(hasUq) && hasUq.length > 0)) {
      await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_user_code" UNIQUE ("user_code")`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_user_code"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "user_code"`);
  }
}
