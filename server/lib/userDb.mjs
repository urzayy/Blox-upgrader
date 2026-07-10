import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const ADMIN_EMAILS = new Set(['urzay1v1@gmail.com', 'ecruzcastillo2009@gmail.com']);

function defaultDbRoot() {
  return path.join(process.cwd(), 'user-db');
}

export function createUserDb(rootDir = process.env.USER_DB_DIR || defaultDbRoot()) {
  const eventsDir = path.join(rootDir, 'events');
  const usersFile = path.join(rootDir, 'users.json');
  const accountsFile = path.join(rootDir, 'accounts.json');

  if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });
  if (!fs.existsSync(eventsDir)) fs.mkdirSync(eventsDir, { recursive: true });

  function loadAccountsStore() {
    if (!fs.existsSync(accountsFile)) {
      return { version: 1, accounts: {}, byEmail: {} };
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
      if (!parsed || typeof parsed.accounts !== 'object' || typeof parsed.byEmail !== 'object') {
        return { version: 1, accounts: {}, byEmail: {} };
      }
      return { version: 1, accounts: parsed.accounts, byEmail: parsed.byEmail };
    } catch {
      return { version: 1, accounts: {}, byEmail: {} };
    }
  }

  function saveAccountsStore(store) {
    fs.writeFileSync(accountsFile, JSON.stringify(store, null, 2), 'utf8');
  }

  function loadUsersIndex() {
    if (!fs.existsSync(usersFile)) {
      return { version: 1, users: {} };
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      if (!parsed || typeof parsed !== 'object' || typeof parsed.users !== 'object') {
        return { version: 1, users: {} };
      }
      return { version: 1, users: parsed.users };
    } catch {
      return { version: 1, users: {} };
    }
  }

  function saveUsersIndex(index) {
    fs.writeFileSync(usersFile, JSON.stringify(index, null, 2), 'utf8');
  }

  function eventsPath(userId) {
    return path.join(eventsDir, `${userId}.jsonl`);
  }

  function normalizeEmail(email) {
    return String(email).trim().toLowerCase();
  }

  function parseLogLine(line) {
    const trimmed = String(line).trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return { action: null, details: {}, line: trimmed };
    }
    const match = trimmed.match(/^\[([^\]]+)\]\s+(\S+)(?:\s+\|\s+(.*))?$/);
    if (!match) return { action: 'UNKNOWN', details: {}, line: trimmed };

    const details = {};
    if (match[3]) {
      for (const part of match[3].split(' | ')) {
        const eq = part.indexOf('=');
        if (eq === -1) continue;
        details[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
      }
    }

    return { action: match[2], details, line: trimmed, loggedAt: match[1] };
  }

  function upsertUser({ userId, email, nickname, isNewAccount = false }) {
    if (!userId || !email) return null;

    const normalizedEmail = normalizeEmail(email);
    const index = loadUsersIndex();
    const now = Date.now();
    const existing = index.users[userId];

    index.users[userId] = {
      id: userId,
      email: normalizedEmail,
      nickname: nickname?.trim() || existing?.nickname || null,
      createdAt: existing?.createdAt ?? now,
      lastSeenAt: now,
      eventCount: existing?.eventCount ?? 0,
      isNewAccount: existing ? existing.isNewAccount : Boolean(isNewAccount),
    };

    saveUsersIndex(index);
    return index.users[userId];
  }

  function appendEvent({ userId, email, line, action, details }) {
    const normalizedEmail = normalizeEmail(email);
    let resolvedUserId = userId;

    if (!resolvedUserId && normalizedEmail) {
      const index = loadUsersIndex();
      resolvedUserId = Object.values(index.users).find(u => u.email === normalizedEmail)?.id;
    }

    if (!resolvedUserId) {
      resolvedUserId = `usr_anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    const parsed = parseLogLine(line);
    const eventAction = action || parsed.action || 'UNKNOWN';
    const eventDetails = details && typeof details === 'object' ? details : parsed.details;
    const now = Date.now();

    upsertUser({
      userId: resolvedUserId,
      email: normalizedEmail || email,
      nickname: eventDetails.nickname,
    });

    const event = {
      id: `ev_${now}_${Math.random().toString(36).slice(2, 8)}`,
      userId: resolvedUserId,
      email: normalizedEmail || email,
      action: eventAction,
      details: eventDetails,
      line: parsed.line || line,
      createdAt: now,
    };

    fs.appendFileSync(eventsPath(resolvedUserId), `${JSON.stringify(event)}\n`, 'utf8');

    const index = loadUsersIndex();
    if (index.users[resolvedUserId]) {
      index.users[resolvedUserId].eventCount = (index.users[resolvedUserId].eventCount ?? 0) + 1;
      index.users[resolvedUserId].lastSeenAt = now;
      saveUsersIndex(index);
    }

    return event;
  }

  function listUsers() {
    const index = loadUsersIndex();
    const byEmail = new Map();
    for (const user of Object.values(index.users)) {
      const prev = byEmail.get(user.email);
      if (!prev || user.lastSeenAt > prev.lastSeenAt) byEmail.set(user.email, user);
    }
    return [...byEmail.values()].sort((a, b) => b.lastSeenAt - a.lastSeenAt);
  }

  function getUser(userId) {
    const index = loadUsersIndex();
    return index.users[userId] ?? null;
  }

  function getUserEvents(userId, limit = 500) {
    const filePath = eventsPath(userId);
    if (!fs.existsSync(filePath)) return [];

    const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n').filter(Boolean);
    const slice = lines.slice(Math.max(0, lines.length - limit));
    return slice.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return { line, action: 'UNKNOWN', createdAt: 0 };
      }
    });
  }

  function exportUserTxt(userId) {
    const user = getUser(userId);
    const events = getUserEvents(userId, 10_000);
    const header = [
      '# Blox Upgrader — Activity log',
      `# User: ${user?.email ?? 'unknown'}`,
      `# ID: ${userId}`,
      `# Events: ${events.length}`,
      '',
    ].join('\n');
    const body = events.map(e => e.line || `[${new Date(e.createdAt).toLocaleString('en-US')}] ${e.action}`).join('\n');
    return `${header}${body}\n`;
  }

  function hashPassword(password, salt) {
    return createHash('sha256').update(`${salt}:${String(password)}`).digest('hex');
  }

  function getAccountByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    const store = loadAccountsStore();
    const userId = store.byEmail[normalizedEmail];
    if (!userId) return null;
    return store.accounts[userId] ?? null;
  }

  function authenticateAccount({ email, password }) {
    const account = getAccountByEmail(email);
    if (!account?.passwordHash || !account.salt) {
      return { ok: false, notFound: true };
    }
    const hash = hashPassword(password, account.salt);
    if (hash !== account.passwordHash) {
      return { ok: false, wrongPassword: true };
    }
    return {
      ok: true,
      userId: account.id,
      email: account.email,
      nickname: account.nickname ?? null,
      salt: account.salt,
    };
  }

  function emailExistsOnServer(email) {
    return Boolean(getAccountByEmail(email));
  }

  function registerAccount({
    userId,
    email,
    passwordHash,
    salt,
    createdAt,
    acceptedAge,
    acceptedTerms,
    nickname,
    isNewAccount = true,
  }) {
    if (!userId || !email || !passwordHash || !salt) return null;

    const normalizedEmail = normalizeEmail(email);
    const store = loadAccountsStore();
    const existingAccount = getAccountByEmail(normalizedEmail);
    if (existingAccount) {
      if (!existingAccount.passwordHash && existingAccount.id === userId) {
        store.accounts[userId] = {
          ...existingAccount,
          id: userId,
          email: normalizedEmail,
          passwordHash,
          salt,
          createdAt: createdAt ?? existingAccount.createdAt ?? Date.now(),
          acceptedAge: Boolean(acceptedAge),
          acceptedTerms: Boolean(acceptedTerms),
          nickname: nickname?.trim() || existingAccount.nickname || null,
        };
        store.byEmail[normalizedEmail] = userId;
        saveAccountsStore(store);
        const user = upsertUser({ userId, email: normalizedEmail, nickname, isNewAccount });
        const line = `[${new Date().toLocaleString('en-US', { hour12: false })}] AUTH.register | email=${normalizedEmail}`;
        const event = appendEvent({
          userId,
          email: normalizedEmail,
          line,
          action: 'AUTH.register',
          details: { email: normalizedEmail },
        });
        return { user, line: event.line };
      }
      return { conflict: true };
    }
    store.accounts[userId] = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      salt,
      createdAt: createdAt ?? Date.now(),
      acceptedAge: Boolean(acceptedAge),
      acceptedTerms: Boolean(acceptedTerms),
      nickname: nickname?.trim() || null,
    };
    store.byEmail[normalizedEmail] = userId;
    saveAccountsStore(store);

    const user = upsertUser({ userId, email: normalizedEmail, nickname, isNewAccount });
    const line = `[${new Date().toLocaleString('en-US', { hour12: false })}] AUTH.register | email=${normalizedEmail}`;
    const event = appendEvent({
      userId,
      email: normalizedEmail,
      line,
      action: 'AUTH.register',
      details: { email: normalizedEmail },
    });

    return { user, line: event.line };
  }

  function touchAccountLogin({ userId, email, nickname }) {
    if (!userId || !email) return null;
    const normalizedEmail = normalizeEmail(email);
    const store = loadAccountsStore();
    let resolvedUserId = userId;
    if (store.byEmail[normalizedEmail]) {
      resolvedUserId = store.byEmail[normalizedEmail];
    }
    if (store.accounts[resolvedUserId]) {
      store.accounts[resolvedUserId].lastLoginAt = Date.now();
      if (nickname?.trim()) store.accounts[resolvedUserId].nickname = nickname.trim();
      saveAccountsStore(store);
    } else if (store.byEmail[normalizedEmail]) {
      const id = store.byEmail[normalizedEmail];
      store.accounts[id] = {
        ...(store.accounts[id] ?? {}),
        id,
        email: normalizedEmail,
        lastLoginAt: Date.now(),
      };
      saveAccountsStore(store);
      resolvedUserId = id;
    } else {
      store.accounts[userId] = {
        id: userId,
        email: normalizedEmail,
        nickname: nickname?.trim() || null,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        syncedFromClient: true,
      };
      store.byEmail[normalizedEmail] = userId;
      saveAccountsStore(store);
      resolvedUserId = userId;
    }

    const user = upsertUser({ userId: resolvedUserId, email: normalizedEmail, nickname, isNewAccount: false });
    const line = `[${new Date().toLocaleString('en-US', { hour12: false })}] AUTH.login | email=${normalizedEmail}`;
    const event = appendEvent({
      userId: resolvedUserId,
      email: normalizedEmail,
      line,
      action: 'AUTH.login',
      details: { email: normalizedEmail },
    });

    return { user, line: event.line, canonicalUserId: resolvedUserId };
  }

  function getUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    const index = loadUsersIndex();
    return Object.values(index.users).find(u => u.email === normalizedEmail) ?? null;
  }

  function isAdminEmail(email) {
    return ADMIN_EMAILS.has(normalizeEmail(email));
  }

  function listRegisteredEmails() {
    const store = loadAccountsStore();
    return Object.values(store.accounts)
      .map(a => a.email)
      .sort((a, b) => a.localeCompare(b));
  }

  function clearUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    if (ADMIN_EMAILS.has(normalizedEmail)) {
      throw new Error('Cannot reset admin accounts');
    }

    const store = loadAccountsStore();
    let userId = store.byEmail[normalizedEmail] ?? null;
    if (!userId) {
      const user = getUserByEmail(normalizedEmail);
      userId = user?.id ?? null;
    }

    if (userId && store.accounts[userId]) {
      delete store.accounts[userId];
      saveAccountsStore(store);
    }
    if (store.byEmail[normalizedEmail]) {
      delete store.byEmail[normalizedEmail];
      saveAccountsStore(store);
    }

    const index = loadUsersIndex();
    if (userId && index.users[userId]) {
      delete index.users[userId];
      saveUsersIndex(index);
    }

    if (userId) {
      const evPath = eventsPath(userId);
      if (fs.existsSync(evPath)) fs.unlinkSync(evPath);
    }

    return { cleared: Boolean(userId), userId };
  }

  return {
    rootDir,
    upsertUser,
    registerAccount,
    touchAccountLogin,
    authenticateAccount,
    emailExistsOnServer,
    getAccountByEmail,
    appendEvent,
    listUsers,
    listRegisteredEmails,
    getUser,
    getUserByEmail,
    getUserEvents,
    exportUserTxt,
    clearUserByEmail,
    isAdminEmail,
    ADMIN_EMAILS: [...ADMIN_EMAILS],
  };
}
