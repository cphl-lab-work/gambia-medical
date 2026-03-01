import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLogs1730000000024 implements MigrationInterface {
  name = "CreateLogs1730000000024";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "logs" (
        "id"              uuid          NOT NULL DEFAULT gen_random_uuid(),
        "user_id"         uuid,
        "client_id"       varchar(255),
        "operation_type"  varchar(50)   NOT NULL,
        "table_name"      varchar(100),
        "user_type"       varchar(50),
        "record_id"       uuid,
        "executed_by"     uuid,
        "operation_query" text,
        "old_data"        jsonb,
        "new_data"        jsonb,
        "ip_address"      varchar(45),
        "status"          varchar(20)   NOT NULL DEFAULT 'success',
        "created_at"      TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_logs_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users"("id")
          ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "FK_logs_executed_by"
          FOREIGN KEY ("executed_by") REFERENCES "users"("id")
          ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_logs_user_id"       ON "logs" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_logs_operation_type" ON "logs" ("operation_type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_logs_table_name"     ON "logs" ("table_name")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_logs_created_at"     ON "logs" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_logs_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_logs_table_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_logs_operation_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_logs_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "logs"`);
  }
}
