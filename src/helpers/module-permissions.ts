import type { Role } from "./roles";

export type Permission = "create" | "read" | "update" | "delete";

export const MODULES = [
  "patient_clerking",
  "triage",
  "medical_clerking",
  "appointments",
  "lab_orders",
  "imaging",
  "pharmacy",
  "billing",
  "reports",
  "doctors",
  "staff",
  "patients",
  "departments",
  "recipe_management",
  "medicine_management",
  "user_management",
] as const;

export type ModuleId = (typeof MODULES)[number];

/** Per module: which roles can create, read, update, delete. Admin has all by convention. */
export const MODULE_PERMISSIONS: Record<ModuleId, { create: Role[]; read: Role[]; update: Role[]; delete: Role[] }> = {
  patient_clerking: {
    create: ["receptionist", "nurse", "admin", "facility_admin"],
    read: ["receptionist", "nurse", "admin", "doctor", "facility_admin"],
    update: ["receptionist", "nurse", "admin", "facility_admin"],
    delete: ["admin", "facility_admin"],
  },
  triage: {
    create: ["nurse", "receptionist", "admin", "facility_admin"],
    read: ["nurse", "receptionist", "admin", "doctor", "facility_admin"],
    update: ["nurse", "receptionist", "admin", "facility_admin"],
    delete: ["admin", "facility_admin"],
  },
  medical_clerking: {
    create: ["doctor", "admin"],
    read: ["doctor", "admin", "nurse", "receptionist", "facility_admin"],
    update: ["doctor", "admin"],
    delete: ["admin"],
  },
  appointments: {
    create: ["receptionist", "nurse", "admin", "facility_admin"],
    read: ["receptionist", "nurse", "accountant", "admin", "doctor", "facility_admin"],
    update: ["receptionist", "nurse", "accountant", "admin", "facility_admin"],
    delete: ["admin", "facility_admin"],
  },
  lab_orders: {
    create: ["doctor", "lab_tech", "admin"],
    read: ["doctor", "lab_tech", "admin", "nurse", "receptionist", "facility_admin"],
    update: ["lab_tech", "admin"],
    delete: ["admin"],
  },
  imaging: {
    create: ["doctor", "admin"],
    read: ["doctor", "lab_tech", "admin", "nurse", "facility_admin"],
    update: ["lab_tech", "admin"],
    delete: ["admin"],
  },
  pharmacy: {
    create: ["doctor", "pharmacist", "admin"],
    read: ["pharmacist", "admin", "doctor", "nurse", "facility_admin"],
    update: ["pharmacist", "admin"],
    delete: ["admin"],
  },
  billing: {
    create: ["accountant", "admin", "facility_admin"],
    read: ["accountant", "admin", "receptionist", "facility_admin"],
    update: ["accountant", "admin", "facility_admin"],
    delete: ["admin"],
  },
  reports: {
    create: ["admin", "accountant", "facility_admin"],
    read: ["admin", "accountant", "receptionist", "doctor", "nurse", "pharmacist", "lab_tech", "facility_admin"],
    update: ["admin", "facility_admin"],
    delete: ["admin"],
  },
  doctors: {
    create: ["admin", "facility_admin"],
    read: ["admin", "doctor", "receptionist", "nurse", "facility_admin"],
    update: ["admin", "facility_admin"],
    delete: ["admin"],
  },
  staff: {
    create: ["admin", "facility_admin"],
    read: ["admin", "facility_admin"],
    update: ["admin", "facility_admin"],
    delete: ["admin"],
  },
  patients: {
    create: ["receptionist", "nurse", "admin", "doctor", "facility_admin"],
    read: ["admin", "doctor", "receptionist", "nurse", "facility_admin"],
    update: ["receptionist", "nurse", "admin", "doctor", "facility_admin"],
    delete: ["admin", "facility_admin"],
  },
  departments: {
    create: ["admin", "facility_admin"],
    read: ["admin", "doctor", "receptionist", "nurse", "facility_admin"],
    update: ["admin", "facility_admin"],
    delete: ["admin"],
  },
  recipe_management: {
    create: ["pharmacist", "admin"],
    read: ["pharmacist", "admin", "facility_admin"],
    update: ["pharmacist", "admin"],
    delete: ["admin"],
  },
  medicine_management: {
    create: ["pharmacist", "admin"],
    read: ["pharmacist", "admin", "facility_admin"],
    update: ["pharmacist", "admin"],
    delete: ["admin"],
  },
  user_management: {
    create: ["admin", "facility_admin"],
    read: ["admin", "facility_admin"],
    update: ["admin", "facility_admin"],
    delete: ["admin"],
  },
};

export function can(role: string | null, moduleId: ModuleId, permission: Permission): boolean {
  if (!role) return false;
  const perms = MODULE_PERMISSIONS[moduleId];
  if (!perms) return false;
  const allowed = perms[permission];
  if (allowed.includes("admin") && role === "admin") return true;
  return allowed.includes(role as Role);
}

export function canCreate(role: string | null, moduleId: ModuleId): boolean {
  return can(role, moduleId, "create");
}
export function canRead(role: string | null, moduleId: ModuleId): boolean {
  return can(role, moduleId, "read");
}
export function canUpdate(role: string | null, moduleId: ModuleId): boolean {
  return can(role, moduleId, "update");
}
export function canDelete(role: string | null, moduleId: ModuleId): boolean {
  return can(role, moduleId, "delete");
}

/** Which roles can view each report type. Admin can see all. */
export type ReportTypeId = "transactions" | "appointments_summary" | "clerking_summary" | "billing_summary";

export const REPORT_TYPE_ACCESS: Record<ReportTypeId, Role[]> = {
  transactions: ["admin", "accountant", "facility_admin"],
  appointments_summary: ["admin", "receptionist", "nurse", "accountant", "facility_admin"],
  clerking_summary: ["admin", "receptionist", "nurse", "facility_admin"],
  billing_summary: ["admin", "accountant", "receptionist", "facility_admin"],
};

export function canViewReportType(role: string | null, reportType: ReportTypeId): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  return REPORT_TYPE_ACCESS[reportType].includes(role as Role);
}
