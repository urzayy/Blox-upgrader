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

async function postJson(url: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
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
}): Promise<boolean> {
  return postJson('/api/auth/register', {
    userId: account.id,
    email: account.email,
    passwordHash: account.passwordHash,
    salt: account.salt,
    createdAt: account.createdAt,
    acceptedAge: account.acceptedAge,
    acceptedTerms: account.acceptedTerms,
    nickname: account.nickname,
  });
}

export async function loginAccountOnServer(payload: SyncUserPayload): Promise<boolean> {
  return postJson('/api/auth/login', payload);
}

export async function syncUserToDb(payload: SyncUserPayload): Promise<boolean> {
  return postJson('/api/users/sync', payload);
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
