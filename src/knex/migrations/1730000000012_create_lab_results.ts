import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "lab_results" (
      "id"              uuid         NOT NULL DEFAULT gen_random_uuid(),
      "lab_order_id"    uuid         NOT NULL,
      "parameter_name"  varchar(255) NOT NULL,
      "value"           varchar(100),
      "unit"            varchar(50),
      "reference_range" varchar(100),
      "flag"            varchar(20),
      "remarks"         text,
      "verified_by"     uuid,
      "created_at"      TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "PK_lab_results_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_lab_results_order"
        FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "FK_lab_results_verified_by"
        FOREIGN KEY ("verified_by") REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_lab_results_order_id" ON "lab_results" ("lab_order_id")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_lab_results_order_id"`);
  await knex.raw(`DROP TABLE IF EXISTS "lab_results"`);
}
