import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLabResults1730000000012 implements MigrationInterface {
  name = "CreateLabResults1730000000012";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "lab_results" (
        "id"              uuid          NOT NULL DEFAULT gen_random_uuid(),
        "lab_order_id"    uuid          NOT NULL,
        "parameter_name"  varchar(255)  NOT NULL,
        "value"           varchar(100),
        "unit"            varchar(50),
        "reference_range" varchar(100),
        "flag"            varchar(20),
        "remarks"         text,
        "verified_by"     uuid,
        "created_at"      TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lab_results_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_lab_results_order"
          FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id")
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_lab_results_verified_by"
          FOREIGN KEY ("verified_by") REFERENCES "users"("id")
          ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_lab_results_order_id" ON "lab_results" ("lab_order_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_lab_results_order_id"`);
    await queryRunner.query(`DROP TABLE "lab_results"`);
  }
}
