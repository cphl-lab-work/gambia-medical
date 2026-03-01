import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "roles" (
      "id"           uuid         NOT NULL DEFAULT uuid_generate_v4(),
      "name"         varchar(50)  NOT NULL,
      "display_name" varchar(255),
      "description"  text,
      "created_at"   TIMESTAMP    NOT NULL DEFAULT now(),
      "updated_at"   TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
      CONSTRAINT "PK_roles_id"   PRIMARY KEY ("id")
    )
  `);

  await knex.raw(`
    INSERT INTO "roles" ("name", "display_name") VALUES
      ('admin',          'Admin'),
      ('facility_admin', 'Facility Admin'),
      ('doctor',         'Doctor'),
      ('nurse',          'Nurse'),
      ('receptionist',   'Receptionist'),
      ('accountant',     'Accountant'),
      ('pharmacist',     'Pharmacist'),
      ('lab_tech',       'Lab Tech')
    ON CONFLICT ("name") DO NOTHING
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE IF EXISTS "roles"');
}
