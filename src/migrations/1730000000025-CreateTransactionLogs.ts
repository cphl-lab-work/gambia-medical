import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransactionLogs1730000000025 implements MigrationInterface {
  name = "CreateTransactionLogs1730000000025";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "transaction_logs" (
        "id"            uuid          NOT NULL DEFAULT gen_random_uuid(),
        "trans_id"      varchar(100)  NOT NULL,
        "status"        varchar(30)   NOT NULL,
        "step"          varchar(50),
        "response_code" varchar(20),
        "description"   text,
        "data"          jsonb,
        "created_at"    TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transaction_logs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_txn_logs_trans_id" ON "transaction_logs" ("trans_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_txn_logs_status"   ON "transaction_logs" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_txn_logs_created_at" ON "transaction_logs" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_txn_logs_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_txn_logs_status"`);
    await queryRunner.query(`DROP INDEX "IDX_txn_logs_trans_id"`);
    await queryRunner.query(`DROP TABLE "transaction_logs"`);
  }
}
