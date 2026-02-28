/**
 * One-time script: insert migration records for migrations already applied
 * to the database (from a previous schema). Run this if db:migrate fails with
 * "relation already exists" because the DB was set up with different migrations.
 *
 * Usage: npx ts-node --project tsconfig.server.json scripts/sync-migration-baseline.ts
 */

import "dotenv/config";
import { DataSource } from "typeorm";

const migrationsToMarkAsRun: { timestamp: number; name: string }[] = [
  { timestamp: 1730000000000, name: "CreateUsers1730000000000" },
  { timestamp: 1730000000001, name: "CreatePatientClerking1730000000001" },
  { timestamp: 1730000000002, name: "CreateAppointments1730000000002" },
  { timestamp: 1730000000003, name: "CreatePrescriptions1730000000003" },
  { timestamp: 1730000000004, name: "CreateRoles1730000000004" },
  { timestamp: 1730000000005, name: "AddRoleForeignKeyToUsers1730000000005" },
  { timestamp: 1730000000006, name: "CreateMenuItems1730000000006" },
  { timestamp: 1730000000007, name: "CreatePatients1730000000007" },
  { timestamp: 1730000000008, name: "CreateDepartments1730000000008" },
  { timestamp: 1730000000009, name: "CreateEncounters1730000000009" },
  { timestamp: 1730000000010, name: "CreateVitalSigns1730000000010" },
  { timestamp: 1730000000011, name: "CreateLabOrders1730000000011" },
  { timestamp: 1730000000012, name: "CreateLabResults1730000000012" },
  { timestamp: 1730000000013, name: "CreateInvoices1730000000013" },
  { timestamp: 1730000000014, name: "CreatePharmacyStock1730000000014" },
  { timestamp: 1730000000015, name: "AddUserCodeToUsers1730000000015" },
  { timestamp: 1730000000016, name: "AddPhoneStatusDatesToUsers1730000000016" },
  { timestamp: 1730000000017, name: "CreateEmployees1730000000017" },
  { timestamp: 1730000000018, name: "AddEmployeeIdToUsers1730000000018" },
  { timestamp: 1730000000019, name: "RenamePasswordHashColumn1730000000019" },
  { timestamp: 1730000000020, name: "EnhanceRoles1730000000020" },
  { timestamp: 1730000000021, name: "CreateModulesAndRoleModulePermissions1730000000021" },
  { timestamp: 1730000000022, name: "CreateRoleMenuItems1730000000022" },
];

async function run() {
  const ds = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT ?? "5432", 10),
    username: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "hm2",
    migrationsTableName: "migrations",
    migrations: [],
  });

  await ds.initialize();

  const table = ds.options.migrationsTableName ?? "migrations";

  for (const { timestamp, name } of migrationsToMarkAsRun) {
    try {
      await ds.query(
        `INSERT INTO "${table}" (timestamp, name) SELECT $1::bigint, $2 WHERE NOT EXISTS (SELECT 1 FROM "${table}" WHERE name = $2)`,
        [timestamp, name]
      );
      console.log(`Marked as run: ${name}`);
    } catch (e) {
      console.warn(`Skip or error for ${name}:`, (e as Error).message);
    }
  }

  await ds.destroy();
  console.log("Done. Run npm run db:migrate to apply remaining migrations.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
