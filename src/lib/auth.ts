import { loginAccountOnServer, registerAccountOnServer, requestServerSession } from './userDbApi';
import { fetchAccountBanStatus } from './accountBanApi';
import { applyPlayerStateSnapshot } from './playerStateHydration';
import {
  type ProfileAvatarId,
  avatarIdFromEmail,
  pickRandomAvatarId,
} from './profileAvatars';

export interface Account {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
  acceptedAge: boolean;
  acceptedTerms: boolean;
  nickname?: string;
  avatarId?: ProfileAvatarId;
}

export interface Session {
  userId: string;
  email: string;
  nickname?: string;
  avatarId?: ProfileAvatarId;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  isNewAccount?: boolean;
}

const ACCOUNTS_KEY = 'blox-upgrader/accounts';
const SESSION_KEY = 'blox-upgrader/session';

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const accounts = parsed.filter(isAccount);
    return migrateAccountsAvatars(accounts);
  } catch {
    return [];
  }
}

function migrateAccountsAvatars(accounts: Account[]): Account[] {
  let changed = false;
  const next = accounts.map(account => {
    if (account.avatarId === 1 || account.avatarId === 2 || account.avatarId === 3) {
      return account;
    }
    changed = true;
    return { ...account, avatarId: avatarIdFromEmail(account.email) };
  });
  if (changed) saveAccounts(next);
  return next;
}

function saveAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    /* storage blocked */
  }
}

function isAccount(value: unknown): value is Account {
  if (!value || typeof value !== 'object') return false;
  const a = value as Account;
  return (
    typeof a.id === 'string'
    && typeof a.email === 'string'
    && typeof a.passwordHash === 'string'
    && typeof a.salt === 'string'
    && typeof a.createdAt === 'number'
    && typeof a.acceptedAge === 'boolean'
    && typeof a.acceptedTerms === 'boolean'
    && (a.nickname === undefined || typeof a.nickname === 'string')
    && (a.avatarId === undefined || a.avatarId === 1 || a.avatarId === 2 || a.avatarId === 3)
  );
}

function sessionFromAccount(account: Account): Session {
  return {
    userId: account.id,
    email: account.email,
    nickname: account.nickname,
    avatarId: account.avatarId ?? avatarIdFromEmail(account.email),
  };
}

function enrichSession(session: Session): Session | null {
  const account = loadAccounts().find(a => a.id === session.userId);
  if (!account) return null;
  return sessionFromAccount(account);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const s = parsed as Session;
    if (typeof s.userId !== 'string' || typeof s.email !== 'string') return null;

    const exists = loadAccounts().some(a => a.id === s.userId);
    if (!exists) return null;
    return enrichSession(s);
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null): void {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}

export function findAccountByEmail(email: string): Account | null {
  const normalized = normalizeEmail(email);
  return loadAccounts().find(a => a.email === normalized) ?? null;
}

export function findAccountByUserId(userId: string): Account | null {
  return loadAccounts().find(a => a.id === userId) ?? null;
}

export async function pushAccountToServer(userId: string): Promise<boolean> {
  const account = findAccountByUserId(userId);
  if (account) {
    const result = await registerAccountOnServer(account);
    if (result === 'ok') return true;
    if (result === 'conflict') {
      return loginAccountOnServer({
        userId: account.id,
        email: account.email,
        nickname: account.nickname,
      });
    }
    return false;
  }
  const session = loadSession();
  if (session?.userId === userId) {
    return loginAccountOnServer({
      userId: session.userId,
      email: session.email,
      nickname: session.nickname,
    });
  }
  return false;
}

async function upsertLocalAccountFromCredentials(
  accounts: Account[],
  payload: {
    userId: string;
    email: string;
    password: string;
    salt?: string;
    nickname?: string;
    acceptedAge?: boolean;
    acceptedTerms?: boolean;
    createdAt?: number;
    avatarId?: ProfileAvatarId;
  },
): Promise<Account> {
  const normalized = normalizeEmail(payload.email);
  const salt = payload.salt ?? randomSalt();
  const passwordHash = await hashPassword(payload.password, salt);
  const existing = accounts.find(a => a.email === normalized);

  const account: Account = {
    id: payload.userId,
    email: normalized,
    passwordHash,
    salt,
    createdAt: existing?.createdAt ?? payload.createdAt ?? Date.now(),
    acceptedAge: existing?.acceptedAge ?? payload.acceptedAge ?? true,
    acceptedTerms: existing?.acceptedTerms ?? payload.acceptedTerms ?? true,
    nickname: payload.nickname?.trim() || existing?.nickname,
    avatarId: existing?.avatarId ?? payload.avatarId ?? avatarIdFromEmail(normalized),
  };

  const nextAccounts = accounts.filter(a => a.email !== normalized && a.id !== payload.userId);
  nextAccounts.push(account);
  saveAccounts(nextAccounts);
  return account;
}

export async function loginOrRegister(
  email: string,
  password: string,
  opts: { acceptedAge: boolean; acceptedTerms: boolean },
): Promise<AuthResult & { session?: Session }> {
  const normalized = normalizeEmail(email);

  if (!normalized) return { ok: false, error: 'Enter your email address.' };
  if (!isValidEmail(normalized)) return { ok: false, error: 'Invalid email address.' };
  if (!password) return { ok: false, error: 'Enter your password.' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

  const accounts = loadAccounts();
  const existing = accounts.find(a => a.email === normalized);
  const serverSession = await requestServerSession(normalized, password);

  if (serverSession.wrongPassword) {
    return { ok: false, error: 'Incorrect password.' };
  }

  if (serverSession.ok && serverSession.user) {
    const banStatus = await fetchAccountBanStatus(normalized);
    if (banStatus.banned) {
      return { ok: false, error: 'Account suspended.' };
    }

    const account = await upsertLocalAccountFromCredentials(accounts, {
      userId: serverSession.user.userId,
      email: normalized,
      password,
      salt: serverSession.user.salt,
      nickname: serverSession.user.nickname ?? existing?.nickname,
      acceptedAge: existing?.acceptedAge ?? opts.acceptedAge,
      acceptedTerms: existing?.acceptedTerms ?? opts.acceptedTerms,
      avatarId: existing?.avatarId,
    });

    if (serverSession.playerState) {
      applyPlayerStateSnapshot(account.id, serverSession.playerState);
    }

    const session = sessionFromAccount(account);
    saveSession(session);
    await loginAccountOnServer({
      userId: account.id,
      email: account.email,
      nickname: account.nickname,
    });
    return { ok: true, session, isNewAccount: false };
  }

  if (existing) {
    const hash = await hashPassword(password, existing.salt);
    if (hash !== existing.passwordHash) {
      return { ok: false, error: 'Incorrect password.' };
    }
    const banStatus = await fetchAccountBanStatus(normalized);
    if (banStatus.banned) {
      return { ok: false, error: 'Account suspended.' };
    }
    const session = sessionFromAccount(existing);
    saveSession(session);
    await loginAccountOnServer({
      userId: existing.id,
      email: existing.email,
      nickname: existing.nickname,
    });
    return { ok: true, session };
  }

  if (!serverSession.notFound) {
    return { ok: false, error: 'Could not log in. Please try again.' };
  }

  if (!opts.acceptedAge || !opts.acceptedTerms) {
    return {
      ok: false,
      error: 'You must confirm you are 18 or older and accept the terms of service to create your account.',
    };
  }

  const banStatus = await fetchAccountBanStatus(normalized);
  if (banStatus.banned) {
    return { ok: false, error: 'Account suspended.' };
  }

  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const account: Account = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email: normalized,
    passwordHash,
    salt,
    createdAt: Date.now(),
    acceptedAge: opts.acceptedAge,
    acceptedTerms: opts.acceptedTerms,
    avatarId: pickRandomAvatarId(),
  };

  saveAccounts([...accounts, account]);
  const session = sessionFromAccount(account);
  saveSession(session);
  const registered = await registerAccountOnServer(account);
  if (registered === 'conflict') {
    saveSession(null);
    const withoutNew = accounts.filter(a => a.id !== account.id);
    saveAccounts(withoutNew);
    return { ok: false, error: 'This account already exists. Log in with your email.' };
  }
  return { ok: true, session, isNewAccount: true };
}

export function getDisplayName(session: Session | null): string {
  if (!session) return 'Guest';
  if (session.nickname?.trim()) return session.nickname.trim();
  return session.email.split('@')[0];
}

export function getProfileLabel(session: Session): string {
  if (session.nickname?.trim()) return session.nickname.trim();
  return session.email;
}

export function updateNickname(
  userId: string,
  nickname: string,
): { ok: boolean; error?: string; session?: Session } {
  const trimmed = nickname.trim();
  if (trimmed.length > 20) {
    return { ok: false, error: 'Nickname can be at most 20 characters.' };
  }
  if (trimmed && !/^[\w\s.-]{2,20}$/u.test(trimmed)) {
    return { ok: false, error: 'Use 2–20 characters (letters, numbers, spaces, . - _).' };
  }

  const accounts = loadAccounts();
  const index = accounts.findIndex(a => a.id === userId);
  if (index === -1) return { ok: false, error: 'Account not found.' };

  const nextNickname = trimmed || undefined;
  accounts[index] = { ...accounts[index], nickname: nextNickname };
  saveAccounts(accounts);

  const current = loadSession();
  if (current?.userId === userId) {
    const session: Session = { ...current, nickname: nextNickname };
    saveSession(session);
    return { ok: true, session };
  }

  return { ok: true };
}

export function logout(): void {
  saveSession(null);
}

export const ADMIN_EMAILS = ['urzay1v1@gmail.com', 'ecruzcastillo2009@gmail.com'] as const;

export function isAdmin(session: Session | null): boolean {
  if (!session) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(session.email);
}
