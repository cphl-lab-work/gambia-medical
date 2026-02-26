export const ROLES = [
  "admin",
  "doctor",
  "nurse",
  "receptionist",
  "accountant",
  "pharmacist",
  "lab_tech",
] as const;

export type Role = (typeof ROLES)[number];

export function isRole(s: string): s is Role {
  return ROLES.includes(s as Role);
}

export function roleDisplayName(role: Role): string {
  const names: Record<Role, string> = {
    admin: "Admin",
    doctor: "Doctor",
    nurse: "Nurse",
    receptionist: "Receptionist",
    accountant: "Accountant",
    pharmacist: "Pharmacist",
    lab_tech: "Lab Tech",
  };
  return names[role];
}
