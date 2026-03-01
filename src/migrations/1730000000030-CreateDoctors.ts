import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Doctors table: records doctors by linking to staff (employees).
 * staff_id = employees.id so each doctor is a staff member.
 */
export class CreateDoctors1730000000030 implements MigrationInterface {
  name = "CreateDoctors1730000000030";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "doctors" (
        "id"            uuid          NOT NULL DEFAULT gen_random_uuid(),
        "staff_id"      uuid          NOT NULL,
        "created_at"    TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_doctors_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_doctors_staff_id" UNIQUE ("staff_id"),
        CONSTRAINT "FK_doctors_staff"
          FOREIGN KEY ("staff_id") REFERENCES "employees"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_doctors_staff_id" ON "doctors" ("staff_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_doctors_staff_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "doctors"`);
  }
}
