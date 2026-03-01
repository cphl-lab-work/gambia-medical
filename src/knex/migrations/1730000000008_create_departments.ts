import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "departments" (
      "id"                    uuid         NOT NULL DEFAULT gen_random_uuid(),
      "name"                  varchar(100) NOT NULL,
      "code"                  varchar(20),
      "description"           text,
      "head_of_department_id" uuid,
      "is_active"             boolean      NOT NULL DEFAULT true,
      "created_at"            TIMESTAMP    NOT NULL DEFAULT now(),
      "updated_at"            TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "PK_departments_id"   PRIMARY KEY ("id"),
      CONSTRAINT "UQ_departments_name" UNIQUE ("name"),
      CONSTRAINT "FK_departments_hod"
        FOREIGN KEY ("head_of_department_id") REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);

  await knex.raw(`
    INSERT INTO "departments" ("name", "code") VALUES
      ('Outpatient (OPD)',         'OPD'),
      ('Emergency',                'ER'),
      ('Inpatient',                'IPD'),
      ('Laboratory',               'LAB'),
      ('Pharmacy',                 'PHAR'),
      ('Radiology / Imaging',      'RAD'),
      ('Surgery',                  'SURG'),
      ('Obstetrics & Gynaecology', 'OBGY'),
      ('Paediatrics',              'PAED'),
      ('Administration',           'ADMIN')
    ON CONFLICT ("name") DO NOTHING
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS "departments"`);
}
