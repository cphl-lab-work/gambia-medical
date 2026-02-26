/**
 * Local storage helpers for offline-first: store and sync data when DB is unavailable.
 * Uses localStorage for auth/session and a simple key pattern for entities.
 */

const PREFIX = "hm2:";
const AUTH_KEY = `${PREFIX}auth`;
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
