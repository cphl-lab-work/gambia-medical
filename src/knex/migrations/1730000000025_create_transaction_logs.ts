import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "transaction_logs" (
      "id"            uuid         NOT NULL DEFAULT gen_random_uuid(),
      "trans_id"      varchar(100) NOT NULL,
      "status"        varchar(30)  NOT NULL,
      "step"          varchar(50),
      "response_code" varchar(20),
      "description"   text,
      "data"          jsonb,
      "created_at"    TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "PK_transaction_logs_id" PRIMARY KEY ("id")
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_txn_logs_trans_id"   ON "transaction_logs" ("trans_id")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_txn_logs_status"     ON "transaction_logs" ("status")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_txn_logs_created_at" ON "transaction_logs" ("created_at")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_txn_logs_created_at"`);
  await knex.raw(`DROP INDEX IF EXISTS "IDX_txn_logs_status"`);
  await knex.raw(`DROP INDEX IF EXISTS "IDX_txn_logs_trans_id"`);
  await knex.raw(`DROP TABLE IF EXISTS "transaction_logs"`);
}
