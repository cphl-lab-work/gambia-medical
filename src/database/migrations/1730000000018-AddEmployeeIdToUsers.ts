import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmployeeIdToUsers1730000000018 implements MigrationInterface {
  name = "AddEmployeeIdToUsers1730000000018";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "employee_id" uuid,
        ADD CONSTRAINT "UQ_users_employee_id" UNIQUE ("employee_id"),
        ADD CONSTRAINT "FK_users_employee_id"
          FOREIGN KEY ("employee_id") REFERENCES "employees"("id")
          ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // Drop the reverse FK from employees → users since the link now lives on users
    await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "FK_employees_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_user_id"`);
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "user_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore employees.user_id
    await queryRunner.query(`ALTER TABLE "employees" ADD COLUMN "user_id" uuid`);
    await queryRunner.query(`CREATE INDEX "IDX_employees_user_id" ON "employees" ("user_id")`);
    await queryRunner.query(`
      ALTER TABLE "employees"
        ADD CONSTRAINT "FK_employees_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id")
          ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // Drop users.employee_id
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_employee_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_employee_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "employee_id"`);
  }
}
