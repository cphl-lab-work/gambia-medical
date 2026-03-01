import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmployeeIdToUsers1730000000018 implements MigrationInterface {
  name = "AddEmployeeIdToUsers1730000000018";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasEmployeeId = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'employee_id'`
    );
    if (Array.isArray(hasEmployeeId) && hasEmployeeId.length > 0) return;

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "employee_id" uuid`);

    const hasUq = await queryRunner.query(`SELECT 1 FROM pg_constraint WHERE conname = 'UQ_users_employee_id'`);
    if (!(Array.isArray(hasUq) && hasUq.length > 0)) {
      await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_employee_id" UNIQUE ("employee_id")`);
    }

    const hasFk = await queryRunner.query(`SELECT 1 FROM pg_constraint WHERE conname = 'FK_users_employee_id'`);
    if (!(Array.isArray(hasFk) && hasFk.length > 0)) {
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD CONSTRAINT "FK_users_employee_id"
        FOREIGN KEY ("employee_id") REFERENCES "employees"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
    }

    await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "FK_employees_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_user_id"`);
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "user_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_employee_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_employee_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "employee_id"`);
    await queryRunner.query(`ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "user_id" uuid`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_employees_user_id" ON "employees" ("user_id")`);
    const hasFk = await queryRunner.query(`SELECT 1 FROM pg_constraint WHERE conname = 'FK_employees_user'`);
    if (!(Array.isArray(hasFk) && hasFk.length > 0)) {
      await queryRunner.query(`
        ALTER TABLE "employees"
        ADD CONSTRAINT "FK_employees_user"
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
    }
  }
}
