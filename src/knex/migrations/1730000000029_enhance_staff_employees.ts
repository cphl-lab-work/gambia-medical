import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Extra columns on employees (idempotent)
  const cols: [string, string][] = [
    ["profile_photo",             "varchar(500)"],
    ["staff_role",                "varchar(50)"],
    ["work_shift",                "varchar(100)"],
    ["qualifications",            "text"],
    ["years_of_experience",       "integer"],
    ["certifications",            "text"],
    ["salary",                    "numeric(14,2)"],
    ["payment_method",            "varchar(50)"],
    ["bank_name",                 "varchar(255)"],
    ["bank_account_number",       "varchar(100)"],
    ["tax_identification_number", "varchar(50)"],
    ["consultation_fee",          "numeric(14,2)"],
    ["available_days",            "varchar(255)"],
    ["available_time",            "varchar(100)"],
    ["assigned_ward",             "varchar(100)"],
  ];
  for (const [col, type] of cols) {
    await knex.raw(`ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "${col}" ${type}`);
  }
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_employees_staff_role" ON "employees" ("staff_role")`);

  // staff_attendance
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "staff_attendance" (
      "id"          uuid        NOT NULL DEFAULT gen_random_uuid(),
      "employee_id" uuid        NOT NULL,
      "date"        date        NOT NULL,
      "check_in"    TIMESTAMP,
      "check_out"   TIMESTAMP,
      "status"      varchar(20) NOT NULL DEFAULT 'present',
      "notes"       text,
      "created_at"  TIMESTAMP   NOT NULL DEFAULT now(),
      "updated_at"  TIMESTAMP   NOT NULL DEFAULT now(),
      CONSTRAINT "PK_staff_attendance_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_staff_attendance_employee"
        FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_staff_attendance_employee_id" ON "staff_attendance" ("employee_id")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_staff_attendance_date"        ON "staff_attendance" ("date")`);

  // staff_leave
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "staff_leave" (
      "id"             uuid        NOT NULL DEFAULT gen_random_uuid(),
      "employee_id"    uuid        NOT NULL,
      "leave_type"     varchar(50) NOT NULL,
      "start_date"     date        NOT NULL,
      "end_date"       date        NOT NULL,
      "status"         varchar(20) NOT NULL DEFAULT 'pending',
      "notes"          text,
      "approved_by_id" uuid,
      "created_at"     TIMESTAMP   NOT NULL DEFAULT now(),
      "updated_at"     TIMESTAMP   NOT NULL DEFAULT now(),
      CONSTRAINT "PK_staff_leave_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_staff_leave_employee"
        FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "FK_staff_leave_approved_by"
        FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_staff_leave_employee_id" ON "staff_leave" ("employee_id")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_staff_leave_dates"       ON "staff_leave" ("start_date", "end_date")`);

  // staff_shift_schedule
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "staff_shift_schedule" (
      "id"             uuid      NOT NULL DEFAULT gen_random_uuid(),
      "employee_id"    uuid      NOT NULL,
      "day_of_week"    integer   NOT NULL,
      "start_time"     time      NOT NULL,
      "end_time"       time      NOT NULL,
      "effective_from" date      NOT NULL DEFAULT CURRENT_DATE,
      "effective_to"   date,
      "created_at"     TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at"     TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_staff_shift_schedule_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_staff_shift_schedule_employee"
        FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_staff_shift_schedule_employee_id" ON "staff_shift_schedule" ("employee_id")`);

  // staff_performance_notes
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "staff_performance_notes" (
      "id"              uuid      NOT NULL DEFAULT gen_random_uuid(),
      "employee_id"     uuid      NOT NULL,
      "note_date"       date      NOT NULL,
      "note"            text      NOT NULL,
      "recorded_by_id"  uuid,
      "created_at"      TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_staff_performance_notes_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_staff_performance_notes_employee"
        FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "FK_staff_performance_notes_recorded_by"
        FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_staff_performance_notes_employee_id" ON "staff_performance_notes" ("employee_id")`);

  // staff_documents
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "staff_documents" (
      "id"            uuid         NOT NULL DEFAULT gen_random_uuid(),
      "employee_id"   uuid         NOT NULL,
      "document_type" varchar(50)  NOT NULL,
      "file_path"     varchar(500) NOT NULL,
      "file_name"     varchar(255),
      "notes"         text,
      "created_at"    TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "PK_staff_documents_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_staff_documents_employee"
        FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_staff_documents_employee_id" ON "staff_documents" ("employee_id")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_staff_documents_type"        ON "staff_documents" ("document_type")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_employees_staff_role"`);
  await knex.raw(`DROP TABLE IF EXISTS "staff_documents"`);
  await knex.raw(`DROP TABLE IF EXISTS "staff_performance_notes"`);
  await knex.raw(`DROP TABLE IF EXISTS "staff_shift_schedule"`);
  await knex.raw(`DROP TABLE IF EXISTS "staff_leave"`);
  await knex.raw(`DROP TABLE IF EXISTS "staff_attendance"`);
  await knex.raw(`
    ALTER TABLE "employees"
      DROP COLUMN IF EXISTS "profile_photo",
      DROP COLUMN IF EXISTS "staff_role",
      DROP COLUMN IF EXISTS "work_shift",
      DROP COLUMN IF EXISTS "qualifications",
      DROP COLUMN IF EXISTS "years_of_experience",
      DROP COLUMN IF EXISTS "certifications",
      DROP COLUMN IF EXISTS "salary",
      DROP COLUMN IF EXISTS "payment_method",
      DROP COLUMN IF EXISTS "bank_name",
      DROP COLUMN IF EXISTS "bank_account_number",
      DROP COLUMN IF EXISTS "tax_identification_number",
      DROP COLUMN IF EXISTS "consultation_fee",
      DROP COLUMN IF EXISTS "available_days",
      DROP COLUMN IF EXISTS "available_time",
      DROP COLUMN IF EXISTS "assigned_ward"
  `);
}
