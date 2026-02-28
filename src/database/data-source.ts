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
import { Module } from "./entity/Module";
import { RoleModulePermission } from "./entity/RoleModulePermission";
import { RoleMenuItem } from "./entity/RoleMenuItem";
import { Facility } from "./entity/Facility";
import { Log } from "./entity/Log";
import { TransactionLog } from "./entity/TransactionLog";

const dbHost = process.env.DB_HOST ?? "localhost";
const dbPort = parseInt(process.env.DB_PORT ?? "5432", 10);
const dbName = process.env.DB_NAME ?? "hm2";
const dbUser = process.env.DB_USER ?? "postgres";
const dbPassword = process.env.DB_PASSWORD ?? "postgres";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,
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
