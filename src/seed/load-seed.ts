/**
 * Load seed data from JSON (for use in API/local fallback). Safe to use in browser for local login.
 */

import usersSeed from "./data/users.json";

export interface SeedUserRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

export const seedUsers = usersSeed as SeedUserRecord[];

export function getSeedUserByEmail(email: string): SeedUserRecord | undefined {
  return seedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
