/**
 * Sync helper: resolve auth from API (Postgres) or fallback to local seed data.
 * Used by login to try DB first, then local.
 */

export type SyncStatus = "online" | "offline" | "syncing";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  token?: string;
}

export async function loginWithSync(
  credentials: LoginCredentials,
  apiLogin: (email: string, password: string) => Promise<AuthUser | null>,
  getLocalUser: (email: string, password: string) => AuthUser | null
): Promise<{ user: AuthUser; fromLocal: boolean } | null> {
  try {
    const user = await apiLogin(credentials.email, credentials.password);
    if (user) return { user, fromLocal: false };
  } catch {
    // API failed (e.g. no DB); fall back to local
  }
  const local = getLocalUser(credentials.email, credentials.password);
  if (local) return { user: local, fromLocal: true };
  return null;
}
