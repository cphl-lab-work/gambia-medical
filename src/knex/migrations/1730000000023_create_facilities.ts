import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "facilities" (
      "id"            uuid         NOT NULL DEFAULT gen_random_uuid(),
      "code"          varchar(20)  NOT NULL,
      "name"          varchar(255) NOT NULL,
      "facility_type" varchar(50),
      "address"       text,
      "phone"         varchar(50),
      "email"         varchar(255),
      "district"      varchar(100),
      "region"        varchar(100),
      "description"   text,
      "is_active"     boolean      NOT NULL DEFAULT true,
      "deleted_at"    TIMESTAMP,
      "created_at"    TIMESTAMP    NOT NULL DEFAULT now(),
      "updated_at"    TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "PK_facilities_id"   PRIMARY KEY ("id"),
      CONSTRAINT "UQ_facilities_code" UNIQUE ("code")
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_facilities_code"      ON "facilities" ("code")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_facilities_is_active" ON "facilities" ("is_active")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_facilities_is_active"`);
  await knex.raw(`DROP INDEX IF EXISTS "IDX_facilities_code"`);
  await knex.raw(`DROP TABLE IF EXISTS "facilities"`);
}
