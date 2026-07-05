import type { RollResult } from './wheelMath';
import { formatPrice } from './currency';
import { logEventToDb, syncUserToDb } from './userDbApi';

const LOG_PREFIX = 'blox-upgrader/user-log';

export interface LogUser {
  userId: string;
  email: string;
  nickname?: string;
}

function logKey(userId: string): string {
  return `${LOG_PREFIX}/${userId}`;
}

function formatTimestamp(date = new Date()): string {
  return date.toLocaleString('es-ES', { hour12: false });
}

function formatDetails(details?: Record<string, string | number | boolean | null | undefined>): string {
  if (!details) return '';
  const parts = Object.entries(details)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${v}`);
  return parts.length ? ` | ${parts.join(' | ')}` : '';
}

function formatLine(action: string, details?: Record<string, string | number | boolean | null | undefined>): string {
  return `[${formatTimestamp()}] ${action}${formatDetails(details)}`;
}

function sanitizeEmailForFile(email: string): string {
  return email.replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function syncLineToDisk(
  user: LogUser,
  line: string,
  action: string,
  details?: Record<string, string | number | boolean | null | undefined>,
): void {
  logEventToDb({
    userId: user.userId,
    email: user.email,
    line,
    action,
    details,
  });
}

export function syncUserAccount(
  user: LogUser,
  opts?: { nickname?: string; isNewAccount?: boolean },
): Promise<boolean> {
  return syncUserToDb({
    userId: user.userId,
    email: user.email,
    nickname: opts?.nickname ?? user.nickname,
    isNewAccount: opts?.isNewAccount,
  });
}

export function initUserLogFile(user: LogUser, isNewAccount = false): void {
  const header = [
    `# Blox Upgrader — Activity log`,
    `# User: ${user.email}`,
    `# ID: ${user.userId}`,
    `# Log started: ${formatTimestamp()}`,
    isNewAccount ? '# (New account)' : '# (First logged session)',
    '',
  ].join('\n');

  const key = logKey(user.userId);
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, header);
    syncUserAccount(user, { isNewAccount });
    syncLineToDisk(user, header, 'META.init');
  }
}

export function appendUserLog(
  user: LogUser | null,
  action: string,
  details?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!user) return;

  initUserLogFile(user);

  const line = formatLine(action, details);
  const key = logKey(user.userId);

  try {
    const prev = localStorage.getItem(key) ?? '';
    localStorage.setItem(key, `${prev}${line}\n`);
    syncLineToDisk(user, line, action, details);
  } catch {
    /* storage full */
  }
}

export function getUserLogText(userId: string): string {
  return localStorage.getItem(logKey(userId)) ?? '';
}

export function downloadUserLog(user: LogUser): void {
  const text = getUserLogText(user.userId);
  const blob = new Blob([text || '(sin registros)\n'], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeEmailForFile(user.email)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function logUpgradeResult(
  user: LogUser | null,
  data: {
    won: boolean;
    probability: number;
    inputLabel: string;
    targetName: string;
    inputTotal: number;
    targetPrice: number;
    roll?: RollResult;
  },
): void {
  appendUserLog(user, data.won ? 'UPGRADE.WIN' : 'UPGRADE.LOSE', {
    input: data.inputLabel,
    inputValue: formatPrice(data.inputTotal),
    target: data.targetName,
    targetValue: formatPrice(data.targetPrice),
    probability: `${data.probability}%`,
    roll: data.roll?.roll,
    winMax: data.roll?.winMax,
  });
}

