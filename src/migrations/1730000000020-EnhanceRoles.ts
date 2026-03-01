import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceRoles1730000000020 implements MigrationInterface {
  name = "EnhanceRoles1730000000020";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "code" varchar(20)`);
    await queryRunner.query(`ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "permissions" text`);
    await queryRunner.query(`ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "is_system_role" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'active'`);
    await queryRunner.query(`ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);

    await queryRunner.query(`
      UPDATE "roles" SET
        "is_system_role" = true,
        "code" = COALESCE("code", UPPER("name"))
      WHERE "is_system_role" = false OR "code" IS NULL
    `);

    const hasUq = await queryRunner.query(`SELECT 1 FROM pg_constraint WHERE conname = 'UQ_roles_code'`);
    if (!(Array.isArray(hasUq) && hasUq.length > 0)) {
      await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "UQ_roles_code" UNIQUE ("code")`);
    }

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_roles_status" ON "roles" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_roles_status"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "UQ_roles_code"`);
    await queryRunner.query(`
      ALTER TABLE "roles"
        DROP COLUMN IF EXISTS "deleted_at",
        DROP COLUMN IF EXISTS "status",
        DROP COLUMN IF EXISTS "is_system_role",
        DROP COLUMN IF EXISTS "permissions",
        DROP COLUMN IF EXISTS "code"
    `);
  }
}
