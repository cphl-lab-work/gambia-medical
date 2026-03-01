import type { Knex } from "knex";

const PERMS = [
  { module: "patient_clerking",    role: "receptionist",   c: true,  r: true,  u: true,  d: false },
  { module: "patient_clerking",    role: "nurse",          c: true,  r: true,  u: true,  d: false },
  { module: "patient_clerking",    role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "patient_clerking",    role: "facility_admin", c: true,  r: true,  u: true,  d: true  },
  { module: "patient_clerking",    role: "doctor",         c: false, r: true,  u: false, d: false },
  { module: "triage",              role: "nurse",          c: true,  r: true,  u: true,  d: false },
  { module: "triage",              role: "receptionist",   c: true,  r: true,  u: true,  d: false },
  { module: "triage",              role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "triage",              role: "facility_admin", c: true,  r: true,  u: true,  d: true  },
  { module: "triage",              role: "doctor",         c: false, r: true,  u: false, d: false },
  { module: "medical_clerking",    role: "doctor",         c: true,  r: true,  u: true,  d: false },
  { module: "medical_clerking",    role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "medical_clerking",    role: "nurse",          c: false, r: true,  u: false, d: false },
  { module: "medical_clerking",    role: "receptionist",   c: false, r: true,  u: false, d: false },
  { module: "medical_clerking",    role: "facility_admin", c: false, r: true,  u: false, d: false },
  { module: "appointments",        role: "receptionist",   c: true,  r: true,  u: true,  d: false },
  { module: "appointments",        role: "nurse",          c: true,  r: true,  u: true,  d: false },
  { module: "appointments",        role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "appointments",        role: "facility_admin", c: true,  r: true,  u: true,  d: true  },
  { module: "appointments",        role: "accountant",     c: false, r: true,  u: true,  d: false },
  { module: "appointments",        role: "doctor",         c: false, r: true,  u: false, d: false },
  { module: "lab_orders",          role: "doctor",         c: true,  r: true,  u: false, d: false },
  { module: "lab_orders",          role: "lab_tech",       c: true,  r: true,  u: true,  d: false },
  { module: "lab_orders",          role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "lab_orders",          role: "nurse",          c: false, r: true,  u: false, d: false },
  { module: "lab_orders",          role: "receptionist",   c: false, r: true,  u: false, d: false },
  { module: "lab_orders",          role: "facility_admin", c: false, r: true,  u: false, d: false },
  { module: "imaging",             role: "doctor",         c: true,  r: true,  u: false, d: false },
  { module: "imaging",             role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "imaging",             role: "lab_tech",       c: false, r: true,  u: true,  d: false },
  { module: "imaging",             role: "nurse",          c: false, r: true,  u: false, d: false },
  { module: "imaging",             role: "facility_admin", c: false, r: true,  u: false, d: false },
  { module: "pharmacy",            role: "doctor",         c: true,  r: true,  u: false, d: false },
  { module: "pharmacy",            role: "pharmacist",     c: true,  r: true,  u: true,  d: false },
  { module: "pharmacy",            role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "pharmacy",            role: "nurse",          c: false, r: true,  u: false, d: false },
  { module: "pharmacy",            role: "facility_admin", c: false, r: true,  u: false, d: false },
  { module: "billing",             role: "accountant",     c: true,  r: true,  u: true,  d: false },
  { module: "billing",             role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "billing",             role: "facility_admin", c: true,  r: true,  u: true,  d: false },
  { module: "billing",             role: "receptionist",   c: false, r: true,  u: false, d: false },
  { module: "reports",             role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "reports",             role: "accountant",     c: true,  r: true,  u: false, d: false },
  { module: "reports",             role: "facility_admin", c: true,  r: true,  u: true,  d: false },
  { module: "reports",             role: "receptionist",   c: false, r: true,  u: false, d: false },
  { module: "reports",             role: "doctor",         c: false, r: true,  u: false, d: false },
  { module: "reports",             role: "nurse",          c: false, r: true,  u: false, d: false },
  { module: "reports",             role: "pharmacist",     c: false, r: true,  u: false, d: false },
  { module: "reports",             role: "lab_tech",       c: false, r: true,  u: false, d: false },
  { module: "doctors",             role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "doctors",             role: "facility_admin", c: true,  r: true,  u: true,  d: false },
  { module: "doctors",             role: "doctor",         c: false, r: true,  u: false, d: false },
  { module: "doctors",             role: "receptionist",   c: false, r: true,  u: false, d: false },
  { module: "doctors",             role: "nurse",          c: false, r: true,  u: false, d: false },
  { module: "staff",               role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "staff",               role: "facility_admin", c: true,  r: true,  u: true,  d: false },
  { module: "patients",            role: "receptionist",   c: true,  r: true,  u: true,  d: false },
  { module: "patients",            role: "nurse",          c: true,  r: true,  u: true,  d: false },
  { module: "patients",            role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "patients",            role: "doctor",         c: true,  r: true,  u: true,  d: false },
  { module: "patients",            role: "facility_admin", c: true,  r: true,  u: true,  d: true  },
  { module: "departments",         role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "departments",         role: "facility_admin", c: true,  r: true,  u: true,  d: false },
  { module: "departments",         role: "doctor",         c: false, r: true,  u: false, d: false },
  { module: "departments",         role: "receptionist",   c: false, r: true,  u: false, d: false },
  { module: "departments",         role: "nurse",          c: false, r: true,  u: false, d: false },
  { module: "recipe_management",   role: "pharmacist",     c: true,  r: true,  u: true,  d: false },
  { module: "recipe_management",   role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "recipe_management",   role: "facility_admin", c: false, r: true,  u: false, d: false },
  { module: "medicine_management", role: "pharmacist",     c: true,  r: true,  u: true,  d: false },
  { module: "medicine_management", role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "medicine_management", role: "facility_admin", c: false, r: true,  u: false, d: false },
  { module: "user_management",     role: "admin",          c: true,  r: true,  u: true,  d: true  },
  { module: "user_management",     role: "facility_admin", c: true,  r: true,  u: true,  d: false },
];

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "modules" (
      "id"           uuid         NOT NULL DEFAULT gen_random_uuid(),
      "code"         varchar(50)  NOT NULL,
      "display_name" varchar(100) NOT NULL,
      "description"  text,
      "icon"         varchar(50),
      "sort_order"   integer      NOT NULL DEFAULT 0,
      "is_active"    boolean      NOT NULL DEFAULT true,
      "created_at"   TIMESTAMP    NOT NULL DEFAULT now(),
      "updated_at"   TIMESTAMP    NOT NULL DEFAULT now(),
      CONSTRAINT "PK_modules_id"   PRIMARY KEY ("id"),
      CONSTRAINT "UQ_modules_code" UNIQUE ("code")
    )
  `);

  await knex.raw(`
    INSERT INTO "modules" ("code", "display_name", "sort_order") VALUES
      ('patient_clerking',    'Patient Clerking',    1),
      ('triage',              'Triage',              2),
      ('medical_clerking',    'Medical Clerking',    3),
      ('appointments',        'Appointments',        4),
      ('lab_orders',          'Lab Orders',          5),
      ('imaging',             'Imaging',             6),
      ('pharmacy',            'Pharmacy',            7),
      ('billing',             'Billing',             8),
      ('reports',             'Reports',             9),
      ('doctors',             'Doctors',             10),
      ('staff',               'Staff',               11),
      ('patients',            'Patients',            12),
      ('departments',         'Departments',         13),
      ('recipe_management',   'Recipe Management',   14),
      ('medicine_management', 'Medicine Management', 15),
      ('user_management',     'User Management',     16)
    ON CONFLICT ("code") DO NOTHING
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS "role_module_permissions" (
      "id"         uuid      NOT NULL DEFAULT gen_random_uuid(),
      "role_id"    uuid      NOT NULL,
      "module_id"  uuid      NOT NULL,
      "can_create" boolean   NOT NULL DEFAULT false,
      "can_read"   boolean   NOT NULL DEFAULT false,
      "can_update" boolean   NOT NULL DEFAULT false,
      "can_delete" boolean   NOT NULL DEFAULT false,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_role_module_permissions_id" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_role_module"                UNIQUE ("role_id", "module_id"),
      CONSTRAINT "FK_rmp_role"
        FOREIGN KEY ("role_id") REFERENCES "roles"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "FK_rmp_module"
        FOREIGN KEY ("module_id") REFERENCES "modules"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_rmp_role_id"   ON "role_module_permissions" ("role_id")`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS "IDX_rmp_module_id" ON "role_module_permissions" ("module_id")`);

  for (const p of PERMS) {
    await knex.raw(`
      INSERT INTO "role_module_permissions" ("role_id","module_id","can_create","can_read","can_update","can_delete")
      SELECT r."id", m."id", ?, ?, ?, ?
      FROM "roles" r, "modules" m
      WHERE r."name" = ? AND m."code" = ?
        AND NOT EXISTS (
          SELECT 1 FROM "role_module_permissions" rmp
          WHERE rmp."role_id" = r."id" AND rmp."module_id" = m."id"
        )
    `, [p.c, p.r, p.u, p.d, p.role, p.module]);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS "IDX_rmp_module_id"`);
  await knex.raw(`DROP INDEX IF EXISTS "IDX_rmp_role_id"`);
  await knex.raw(`DROP TABLE IF EXISTS "role_module_permissions"`);
  await knex.raw(`DROP TABLE IF EXISTS "modules"`);
}
