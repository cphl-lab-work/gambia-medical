import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLabOrders1730000000011 implements MigrationInterface {
  name = "CreateLabOrders1730000000011";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lab_orders" (
        "id"                  uuid          NOT NULL DEFAULT gen_random_uuid(),
        "order_number"        varchar(50)   NOT NULL,
        "encounter_id"        uuid          NOT NULL,
        "test_name"           varchar(255)  NOT NULL,
        "test_category"       varchar(100),
        "priority"            varchar(20),
        "status"              varchar(30)   NOT NULL DEFAULT 'pending',
        "ordered_by"          uuid,
        "clinical_info"       text,
        "sample_collected_at" TIMESTAMP,
        "completed_at"        TIMESTAMP,
        "created_at"          TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"          TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lab_orders_id"     PRIMARY KEY ("id"),
        CONSTRAINT "UQ_lab_orders_number" UNIQUE ("order_number"),
        CONSTRAINT "FK_lab_orders_encounter"
          FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id")
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_lab_orders_ordered_by"
          FOREIGN KEY ("ordered_by") REFERENCES "users"("id")
          ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_lab_orders_encounter_id" ON "lab_orders" ("encounter_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_lab_orders_status"       ON "lab_orders" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_lab_orders_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_lab_orders_encounter_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lab_orders"`);
  }
}
