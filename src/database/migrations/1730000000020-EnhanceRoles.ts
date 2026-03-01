import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceRoles1730000000020 implements MigrationInterface {
  name = "EnhanceRoles1730000000020";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "roles"
        ADD COLUMN "code"           varchar(20),
        ADD COLUMN "permissions"    text,
        ADD COLUMN "is_system_role" boolean NOT NULL DEFAULT false,
        ADD COLUMN "status"         varchar(20) NOT NULL DEFAULT 'active',
        ADD COLUMN "deleted_at"     TIMESTAMP
    `);

    await queryRunner.query(`
      UPDATE "roles" SET
        "is_system_role" = true,
        "code" = UPPER("name")
    `);

    await queryRunner.query(`
      ALTER TABLE "roles"
        ADD CONSTRAINT "UQ_roles_code" UNIQUE ("code")
    `);

    await queryRunner.query(`CREATE INDEX "IDX_roles_status" ON "roles" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_roles_status"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "UQ_roles_code"`);
    await queryRunner.query(`
      ALTER TABLE "roles"
        DROP COLUMN "deleted_at",
        DROP COLUMN "status",
        DROP COLUMN "is_system_role",
        DROP COLUMN "permissions",
        DROP COLUMN "code"
    `);
  }
}
