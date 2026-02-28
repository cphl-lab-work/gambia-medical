import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleForeignKeyToUsers1730000000005 implements MigrationInterface {
  name = "AddRoleForeignKeyToUsers1730000000005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add a new UUID column to hold the FK
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "role_id" uuid
    `);

    // 2. Populate role_id by matching existing role name → roles.id
    await queryRunner.query(`
      UPDATE "users"
      SET "role_id" = r."id"
      FROM "roles" r
      WHERE "users"."role" = r."name"
    `);

    // 3. Make role_id NOT NULL now that it's been populated
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL
    `);

    // 4. Drop the old varchar role column
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "role"
    `);

    // 5. Add the FK constraint
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_role_id"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);

    // 6. Index for faster joins
    await queryRunner.query(`
      CREATE INDEX "IDX_users_role_id" ON "users" ("role_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_role_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_role_id"`);

    // Re-add the varchar role column
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "role" character varying(50)
    `);

    // Populate it back from the roles table
    await queryRunner.query(`
      UPDATE "users"
      SET "role" = r."name"
      FROM "roles" r
      WHERE "users"."role_id" = r."id"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL
    `);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role_id"`);
  }
}
