import type { ComponentType } from "react";
import type { Role } from "@/helpers/roles";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import ReceptionistDashboard from "./ReceptionistDashboard";
import NurseDashboard from "./NurseDashboard";
import AccountantDashboard from "./AccountantDashboard";
import PharmacistDashboard from "./PharmacistDashboard";
import LabTechDashboard from "./LabTechDashboard";
import BlankDashboard from "./BlankDashboard";

export const roleDashboards: Record<Role, ComponentType<{ role?: string | null }>> = {
  admin: AdminDashboard,
  doctor: DoctorDashboard,
  receptionist: ReceptionistDashboard,
  nurse: NurseDashboard,
  accountant: AccountantDashboard,
  pharmacist: PharmacistDashboard,
  lab_tech: LabTechDashboard,
};

export function getDashboardForRole(role: string | null) {
  if (!role) return BlankDashboard;
  const Dashboard = roleDashboards[role as Role];
  return Dashboard ?? BlankDashboard;
}

export { default as AdminDashboard } from "./AdminDashboard";
export { default as DoctorDashboard } from "./DoctorDashboard";
export { default as ReceptionistDashboard } from "./ReceptionistDashboard";
export { default as NurseDashboard } from "./NurseDashboard";
export { default as AccountantDashboard } from "./AccountantDashboard";
export { default as PharmacistDashboard } from "./PharmacistDashboard";
export { default as LabTechDashboard } from "./LabTechDashboard";
export { default as BlankDashboard } from "./BlankDashboard";
