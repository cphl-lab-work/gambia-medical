/**
 * Load seed data from JSON (for use in API/local fallback). Safe to use in browser for local login.
 */

import usersSeed from "./data/users.json";
import facilitiesSeed from "./data/facilities.json";

export interface SeedUserRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface SeedFacilityRecord {
  id: string;
  code: string;
  name: string;
  facilityType: string;
  address: string;
  phone: string;
  email: string;
  district: string;
  region: string;
  description: string;
  facilityAdminId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const seedUsers = usersSeed as SeedUserRecord[];
export const seedFacilities = facilitiesSeed as SeedFacilityRecord[];

export function getSeedUserByEmail(email: string): SeedUserRecord | undefined {
  return seedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getSeedFacilityByCode(code: string): SeedFacilityRecord | undefined {
  return seedFacilities.find((f) => f.code === code);
}

export function getAllSeedFacilities(): SeedFacilityRecord[] {
  return seedFacilities;
}
