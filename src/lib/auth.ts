import { loginAccountOnServer, registerAccountOnServer } from './userDbApi';

export interface Account {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
  acceptedAge: boolean;
  acceptedTerms: boolean;
  nickname?: string;
}

export interface Session {
  userId: string;
  email: string;
  nickname?: string;
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
    return parsed.filter(isAccount);
  } catch {
    return [];
  }
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
  );
}

function sessionFromAccount(account: Account): Session {
  return {
    userId: account.id,
    email: account.email,
    nickname: account.nickname,
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
    return registerAccountOnServer(account);
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

export async function loginOrRegister(
  email: string,
  password: string,
  opts: { acceptedAge: boolean; acceptedTerms: boolean },
): Promise<AuthResult & { session?: Session }> {
  const normalized = normalizeEmail(email);

  if (!normalized) return { ok: false, error: 'Introduce tu correo electrónico.' };
  if (!isValidEmail(normalized)) return { ok: false, error: 'Correo electrónico no válido.' };
  if (!password) return { ok: false, error: 'Introduce tu contraseña.' };
  if (password.length < 6) return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' };

  const accounts = loadAccounts();
  const existing = accounts.find(a => a.email === normalized);

  if (existing) {
    const hash = await hashPassword(password, existing.salt);
    if (hash !== existing.passwordHash) {
      return { ok: false, error: 'Contraseña incorrecta.' };
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

  if (!opts.acceptedAge || !opts.acceptedTerms) {
    return {
      ok: false,
      error: 'Debes aceptar ser mayor de 18 años y los términos del servicio para crear tu cuenta.',
    };
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
  };

  saveAccounts([...accounts, account]);
  const session = sessionFromAccount(account);
  saveSession(session);
  await registerAccountOnServer(account);
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
    return { ok: false, error: 'El apodo puede tener como máximo 20 caracteres.' };
  }
  if (trimmed && !/^[\w\s.-]{2,20}$/u.test(trimmed)) {
    return { ok: false, error: 'Usa entre 2 y 20 caracteres (letras, números, espacios, . - _).' };
  }

  const accounts = loadAccounts();
  const index = accounts.findIndex(a => a.id === userId);
  if (index === -1) return { ok: false, error: 'Cuenta no encontrada.' };

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
