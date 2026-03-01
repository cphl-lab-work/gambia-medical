import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "users" (
      "id"           uuid         NOT NULL DEFAULT uuid_generate_v4(),
      "email"        varchar(255) NOT NULL,
      "passwordHash" varchar(255) NOT NULL,
      "name"         varchar(255) NOT NULL,
      "role"         varchar(50)  NOT NULL,
      "created_at"   TIMESTAMP    NOT NULL DEFAULT now(),
      "updated_at"   TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_users_email" UNIQUE ("email"),
      CONSTRAINT "PK_users_id"    PRIMARY KEY ("id")
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE IF EXISTS "users"');
}
