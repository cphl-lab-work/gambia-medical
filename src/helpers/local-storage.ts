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
const CLERKING_RECORDS_KEY = `${PREFIX}clerking_records`;
const PATIENTS_KEY = `${PREFIX}patients`;
const APPOINTMENTS_KEY = `${PREFIX}appointments`;
const PRESCRIPTIONS_KEY = `${PREFIX}prescriptions`;
const FACILITIES_KEY = `${PREFIX}facilities`;
const CURRENT_FACILITY_KEY = `${PREFIX}current_facility`;
const IPD_ADMISSIONS_KEY = `${PREFIX}ipd_admissions`;

export interface StoredAuth {
  userId: string;
  email: string;
  role: string;
  name: string;
  token: string;
  expiresAt: number;
  /** Linked staff/employee id when user has login access via users.employee_id */
  staffId?: string | null;
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

/** Patient clerking (admission) record. */
export interface ClerkingRecord {
  id: string;
  patientName: string;
  patientId: string | null;
  arrivalSource: string;
  dateOfArrival: string;
  timeOfArrival: string;
  status: string;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  district?: string | null;
  country?: string | null;
  address?: string | null;
  email?: string | null;
  recordedBy: string;
  createdAt: string;
}

export function getClerkingRecords(): ClerkingRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CLERKING_RECORDS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setClerkingRecords(records: ClerkingRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLERKING_RECORDS_KEY, JSON.stringify(records));
}

/** Patients – stored locally until sync to Postgres. */
export function getStoredPatients(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PATIENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setStoredPatients(patients: unknown[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

/** Appointments – stored locally until sync to Postgres. */
export function getStoredAppointments(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setStoredAppointments(appointments: unknown[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
}

/** Prescriptions – stored locally until sync to Postgres. */
export function getStoredPrescriptions(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRESCRIPTIONS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setStoredPrescriptions(prescriptions: unknown[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
}

/** Facility – stored locally for quick access. */
export interface StoredFacility {
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

export function getStoredFacilities(): StoredFacility[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FACILITIES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setStoredFacilities(facilities: StoredFacility[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FACILITIES_KEY, JSON.stringify(facilities));
}

export function getStoredFacilityById(id: string): StoredFacility | null {
  const facilities = getStoredFacilities();
  return facilities.find((f) => f.id === id) || null;
}

export function getStoredFacilityByCode(code: string): StoredFacility | null {
  const facilities = getStoredFacilities();
  return facilities.find((f) => f.code === code) || null;
}

export function addStoredFacility(facility: StoredFacility): void {
  const facilities = getStoredFacilities();
  const exists = facilities.some((f) => f.id === facility.id);
  if (!exists) {
    facilities.push(facility);
    setStoredFacilities(facilities);
  }
}

export function updateStoredFacility(facility: StoredFacility): void {
  const facilities = getStoredFacilities();
  const index = facilities.findIndex((f) => f.id === facility.id);
  if (index >= 0) {
    facilities[index] = facility;
    setStoredFacilities(facilities);
  } else {
    facilities.push(facility);
    setStoredFacilities(facilities);
  }
}

export function removeStoredFacility(id: string): void {
  const facilities = getStoredFacilities();
  const filtered = facilities.filter((f) => f.id !== id);
  setStoredFacilities(filtered);
}

/** Current facility – for context-aware operations. */
export function getCurrentFacility(): StoredFacility | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_FACILITY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredFacility;
  } catch {
    return null;
  }
}

export function setCurrentFacility(facility: StoredFacility | null): void {
  if (typeof window === "undefined") return;
  if (facility) {
    localStorage.setItem(CURRENT_FACILITY_KEY, JSON.stringify(facility));
  } else {
    localStorage.removeItem(CURRENT_FACILITY_KEY);
  }
}

/** IPD (Inpatient Department) admission record. */
export type IpdAdmissionStatus = "admitted" | "discharged" | "transferred";

export interface IpdAdmission {
  id: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  patientGender?: string | null;
  patientAge?: number | null;
  patientPhone?: string | null;
  ward: string;
  bedNumber: string;
  admittingDoctor: string;
  admissionDate: string;
  admissionTime: string;
  diagnosis: string;
  notes: string | null;
  status: IpdAdmissionStatus;
  dischargeDate?: string | null;
  admittedBy: string;
  createdAt: string;
}

export function getStoredIpdAdmissions(): IpdAdmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(IPD_ADMISSIONS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setStoredIpdAdmissions(admissions: IpdAdmission[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(IPD_ADMISSIONS_KEY, JSON.stringify(admissions));
}

/**
 * Sync localStorage data to Postgres APIs. Call when DB is ready.
 * Returns a promise that resolves when sync completes (or fails).
 */
export async function syncToPostgres(): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];
  try {
    const facilities = getStoredFacilities();
    for (const f of facilities) {
      const res = await fetch("/api/facilities", {
        method: (f as { id?: string }).id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) errors.push(`Facility ${f.name}: ${res.status}`);
    }
    const patients = getStoredPatients();
    for (const p of patients) {
      const res = await fetch("/api/patients", {
        method: (p as { id?: string }).id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient: p }),
      });
      if (!res.ok) errors.push(`Patient ${(p as { name?: string }).name ?? "?"}: ${res.status}`);
    }
    const appointments = getStoredAppointments();
    for (const a of appointments) {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a),
      });
      if (!res.ok) errors.push(`Appointment ${(a as { patientName?: string }).patientName ?? "?"}: ${res.status}`);
    }
    const prescriptions = getStoredPrescriptions();
    for (const rx of prescriptions) {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rx),
      });
      if (!res.ok) errors.push(`Prescription ${(rx as { medication?: string }).medication ?? "?"}: ${res.status}`);
    }
    const clerking = getClerkingRecords();
    for (const c of clerking) {
      const res = await fetch("/api/clerking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      if (!res.ok) errors.push(`Clerking ${c.patientName}: ${res.status}`);
    }
    return { ok: errors.length === 0, errors };
  } catch (e) {
    errors.push(String(e));
    return { ok: false, errors };
  }
}
