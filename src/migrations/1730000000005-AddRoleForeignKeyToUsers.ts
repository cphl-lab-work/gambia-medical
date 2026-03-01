import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleForeignKeyToUsers1730000000005 implements MigrationInterface {
  name = "AddRoleForeignKeyToUsers1730000000005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasRoleId = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role_id'`
    );
    if (Array.isArray(hasRoleId) && hasRoleId.length > 0) return;

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "role_id" uuid`);

    await queryRunner.query(`
      UPDATE "users"
      SET "role_id" = r."id"
      FROM "roles" r
      WHERE "users"."role" = r."name" AND "users"."role_id" IS NULL
    `);

    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL`);

    const hasRoleCol = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'`
    );
    if (Array.isArray(hasRoleCol) && hasRoleCol.length > 0) {
      await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    }

    const hasFk = await queryRunner.query(`SELECT 1 FROM pg_constraint WHERE conname = 'FK_users_role_id'`);
    if (!(Array.isArray(hasFk) && hasFk.length > 0)) {
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD CONSTRAINT "FK_users_role_id"
        FOREIGN KEY ("role_id") REFERENCES "roles"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
      `);
    }

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_role_id" ON "users" ("role_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_role_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_role_id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" character varying(50)`);
    await queryRunner.query(`
      UPDATE "users"
      SET "role" = r."name"
      FROM "roles" r
      WHERE "users"."role_id" = r."id"
    `);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role_id"`);
  }
}
