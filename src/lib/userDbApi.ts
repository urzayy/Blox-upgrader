import type { PlayerStateSnapshot } from './playerStateApi';

export interface SyncUserPayload {
  userId: string;
  email: string;
  nickname?: string;
  isNewAccount?: boolean;
}

export interface LogEventPayload {
  userId: string;
  email: string;
  line: string;
  action: string;
  details?: Record<string, string | number | boolean | null | undefined>;
}

async function postJson(url: string, body: unknown, attempts = 3): Promise<Response | null> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok || res.status === 409) return res;
      if (i === attempts - 1) {
        console.warn(`[UserDB] ${url} failed: HTTP ${res.status}`);
      }
    } catch (error) {
      if (i === attempts - 1) {
        console.warn(`[UserDB] ${url} failed:`, error);
      }
    }
    if (i < attempts - 1) {
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
  return null;
}

export interface ServerSessionUser {
  userId: string;
  email: string;
  nickname?: string | null;
  salt?: string;
}

export interface ServerSessionResult {
  ok: boolean;
  notFound?: boolean;
  wrongPassword?: boolean;
  user?: ServerSessionUser;
  playerState?: PlayerStateSnapshot | null;
}

export async function requestServerSession(
  email: string,
  password: string,
): Promise<ServerSessionResult> {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    const data = await res.json().catch(() => ({})) as {
      ok?: boolean;
      notFound?: boolean;
      error?: string;
      user?: ServerSessionUser;
      playerState?: PlayerStateSnapshot | null;
    };
    if (res.status === 404 || data.notFound) {
      return { ok: false, notFound: true };
    }
    if (res.status === 401 || data.error === 'wrong_password') {
      return { ok: false, wrongPassword: true };
    }
    if (!res.ok || !data.ok || !data.user?.userId) {
      return { ok: false };
    }
    return {
      ok: true,
      user: data.user,
      playerState: data.playerState ?? null,
    };
  } catch {
    return { ok: false };
  }
}

export async function registerAccountOnServer(account: {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
  acceptedAge: boolean;
  acceptedTerms: boolean;
  nickname?: string;
}): Promise<'ok' | 'conflict' | 'failed'> {
  const res = await postJson('/api/auth/register', {
    userId: account.id,
    email: account.email,
    passwordHash: account.passwordHash,
    salt: account.salt,
    createdAt: account.createdAt,
    acceptedAge: account.acceptedAge,
    acceptedTerms: account.acceptedTerms,
    nickname: account.nickname,
  });
  if (!res) return 'failed';
  if (res.status === 409) return 'conflict';
  return res.ok ? 'ok' : 'failed';
}

export async function loginAccountOnServer(payload: SyncUserPayload): Promise<boolean> {
  const res = await postJson('/api/auth/login', payload);
  return Boolean(res?.ok);
}

export async function syncUserToDb(payload: SyncUserPayload): Promise<boolean> {
  const res = await postJson('/api/users/sync', payload);
  return Boolean(res?.ok);
}

export async function logEventToDb(payload: LogEventPayload): Promise<void> {
  try {
    await fetch('/api/user-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    /* offline */
  }
}

export interface DbUserRecord {
  id: string;
  email: string;
  nickname: string | null;
  createdAt: number;
  lastSeenAt: number;
  eventCount: number;
  isNewAccount?: boolean;
}

export interface DbUserEvent {
  id: string;
  userId: string;
  email: string;
  action: string;
  details: Record<string, string | number | boolean | null | undefined>;
  line: string;
  createdAt: number;
}

export async function fetchDbUsers(adminEmail: string): Promise<DbUserRecord[]> {
  const res = await fetch(`/api/admin/user-db/users?adminEmail=${encodeURIComponent(adminEmail)}`);
  if (!res.ok) throw new Error('Could not load users');
  const data = await res.json() as { users: DbUserRecord[] };
  return data.users;
}

export async function fetchDbUserDetail(
  adminEmail: string,
  userId: string,
): Promise<{ user: DbUserRecord; events: DbUserEvent[] }> {
  const res = await fetch(
    `/api/admin/user-db/users/${encodeURIComponent(userId)}?adminEmail=${encodeURIComponent(adminEmail)}`,
  );
  if (!res.ok) throw new Error('Could not load user');
  return res.json() as Promise<{ user: DbUserRecord; events: DbUserEvent[] }>;
}

export function dbUserExportUrl(adminEmail: string, userId: string): string {
  return `/api/admin/user-db/users/${encodeURIComponent(userId)}/export.txt?adminEmail=${encodeURIComponent(adminEmail)}`;
}

export interface DbStatus {
  storage: { ok: boolean; path: string; error?: string };
  backend?: string;
  dataDir: string;
  logsDir: string;
  userCount: number;
  registeredEmailCount: number;
  registeredEmails: string[];
  siteUrl: string;
}

export async function fetchDbStatus(adminEmail: string): Promise<DbStatus> {
  const res = await fetch(`/api/admin/user-db/status?adminEmail=${encodeURIComponent(adminEmail)}`);
  if (!res.ok) throw new Error('Could not load database status');
  return res.json() as Promise<DbStatus>;
}
