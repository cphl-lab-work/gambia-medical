/**
 * Local storage helpers for offline-first: store and sync data when DB is unavailable.
 * Uses localStorage for auth/session and a simple key pattern for entities.
 */

const PREFIX = "hm2:";
const AUTH_KEY = `${PREFIX}auth`;
const PROFILE_KEY = `${PREFIX}profile`;
const PATIENT_DATA_ACCESS_KEY = `${PREFIX}patient_data_access`;
const USERS_KEY = `${PREFIX}users`;
const SYNC_QUEUE_KEY = `${PREFIX}sync_queue`;
const LAST_SYNC_KEY = `${PREFIX}last_sync`;

export interface StoredAuth {
  userId: string;
  email: string;
  role: string;
  name: string;
  token: string;
  expiresAt: number;
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredAuth;
    if (data.expiresAt && data.expiresAt < Date.now()) {
      clearStoredAuth();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

export interface StoredProfile {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  title?: string;
}

export function getStoredProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

export function setStoredProfile(profile: StoredProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

/** Patient data category -> which roles can view and edit. Admin can change. */
export type PatientDataCategory = "demographics" | "clinical_notes" | "lab_results" | "prescriptions" | "billing";

export interface PatientDataAccessEntry {
  view: string[]; // role ids
  edit: string[];
}

export type PatientDataAccessConfig = Record<PatientDataCategory, PatientDataAccessEntry>;

const DEFAULT_PATIENT_DATA_ACCESS: PatientDataAccessConfig = {
  demographics: { view: ["admin", "doctor", "nurse", "receptionist"], edit: ["admin", "receptionist", "nurse"] },
  clinical_notes: { view: ["admin", "doctor", "nurse"], edit: ["admin", "doctor"] },
  lab_results: { view: ["admin", "doctor", "lab_tech", "nurse"], edit: ["admin", "lab_tech"] },
  prescriptions: { view: ["admin", "doctor", "pharmacist", "nurse"], edit: ["admin", "doctor", "pharmacist"] },
  billing: { view: ["admin", "accountant", "receptionist"], edit: ["admin", "accountant"] },
};

export function getPatientDataAccessConfig(): PatientDataAccessConfig {
  if (typeof window === "undefined") return DEFAULT_PATIENT_DATA_ACCESS;
  try {
    const raw = localStorage.getItem(PATIENT_DATA_ACCESS_KEY);
    if (!raw) return DEFAULT_PATIENT_DATA_ACCESS;
    return { ...DEFAULT_PATIENT_DATA_ACCESS, ...JSON.parse(raw) } as PatientDataAccessConfig;
  } catch {
    return DEFAULT_PATIENT_DATA_ACCESS;
  }
}

export function setPatientDataAccessConfig(config: PatientDataAccessConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PATIENT_DATA_ACCESS_KEY, JSON.stringify(config));
}

export function getStoredUsers(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setStoredUsers(users: unknown[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSyncQueue(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setSyncQueue(queue: unknown[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function getLastSync(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LAST_SYNC_KEY);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}

export function setLastSync(ts: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_SYNC_KEY, String(ts));
}
