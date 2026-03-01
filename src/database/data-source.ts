import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Role } from "./entity/Role";
import { User } from "./entity/User";
import { Patient } from "./entity/Patient";
import { PatientClerking } from "./entity/PatientClerking";
import { Appointment } from "./entity/Appointment";
import { Prescription } from "./entity/Prescription";
import { MenuItem } from "./entity/MenuItem";
import { Department } from "./entity/Department";
import { Encounter } from "./entity/Encounter";
import { VitalSign } from "./entity/VitalSign";
import { LabOrder } from "./entity/LabOrder";
import { LabResult } from "./entity/LabResult";
import { Invoice } from "./entity/Invoice";
import { InvoiceItem } from "./entity/InvoiceItem";
import { PharmacyStock } from "./entity/PharmacyStock";
import { Employee } from "./entity/Employee";
import { StaffAttendance } from "./entity/StaffAttendance";
import { StaffLeave } from "./entity/StaffLeave";
import { StaffShiftSchedule } from "./entity/StaffShiftSchedule";
import { StaffPerformanceNote } from "./entity/StaffPerformanceNote";
import { StaffDocument } from "./entity/StaffDocument";
import { Doctor } from "./entity/Doctor";
import { Module } from "./entity/Module";
import { RoleModulePermission } from "./entity/RoleModulePermission";
import { RoleMenuItem } from "./entity/RoleMenuItem";
import { Facility } from "./entity/Facility";
import { Log } from "./entity/Log";
import { TransactionLog } from "./entity/TransactionLog";

/**
 * Parse DATABASE_URL and extract ?schema= as a separate option.
 * TypeORM does not read ?schema= from the URL string — it needs to be set via `schema:`.
 */
function parseConnectionUrl(rawUrl: string): { url: string; schema: string | undefined } {
  try {
    const parsed = new URL(rawUrl);
    const schema = parsed.searchParams.get("schema") ?? undefined;
    parsed.search = ""; // strip all query params so TypeORM gets a clean URL
    return { url: parsed.toString(), schema };
  } catch {
    return { url: rawUrl, schema: undefined };
  }
}

const rawUrl = process.env.DATABASE_URL || process.env.DB_URL || "";
const { url: connectionUrl, schema: urlSchema } = rawUrl
  ? parseConnectionUrl(rawUrl)
  : { url: "", schema: undefined };

// Individual connection params (fallback when DATABASE_URL is not set)
const dbHost = process.env.DB_HOST ?? "localhost";
const dbPort = parseInt(process.env.DB_PORT ?? "5432", 10);
const dbName = process.env.DB_NAME ?? "hm2";
const dbUser = process.env.DB_USER ?? "postgres";
const dbPassword = process.env.DB_PASSWORD ?? "postgres";

// Schema: from DATABASE_URL ?schema=, DB_SCHEMA env var, or default "public"
const dbSchema = urlSchema ?? process.env.DB_SCHEMA ?? "public";

export const AppDataSource = new DataSource({
  type: "postgres",
  ...(connectionUrl
    ? { url: connectionUrl }
    : { host: dbHost, port: dbPort, username: dbUser, password: dbPassword, database: dbName }),
  schema: dbSchema,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [
    Role,
    User,
    Patient,
    PatientClerking,
    Appointment,
    Prescription,
    MenuItem,
    Department,
    Encounter,
    VitalSign,
    LabOrder,
    LabResult,
    Invoice,
    InvoiceItem,
    PharmacyStock,
    Employee,
    StaffAttendance,
    StaffLeave,
    StaffShiftSchedule,
    StaffPerformanceNote,
    StaffDocument,
    Doctor,
    Module,
    RoleModulePermission,
    RoleMenuItem,
    Facility,
    Log,
    TransactionLog,
  ],
  migrations: ["src/migrations/*.ts"],
  migrationsTableName: "migrations",
});
