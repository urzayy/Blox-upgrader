import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import {
  createBotFeedItem,
  enrichFeedItem,
  FEED_STATE_VERSION,
} from './src/lib/feedBot.mjs';
import { createUserStore } from './server/lib/userStore.mjs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const DATA_DIR = process.env.DATA_DIR || ROOT;
const USER_DB_DIR = process.env.USER_DB_DIR || path.join(DATA_DIR, 'user-db');
const LOGS_DIR = process.env.USER_LOGS_DIR || path.join(DATA_DIR, 'user-logs');
const CHATS_DIR = process.env.CHATS_DIR || path.join(DATA_DIR, 'withdraw-chats');
const GRANTS_DIR = process.env.GRANTS_DIR || path.join(DATA_DIR, 'inventory-grants');
const BALANCE_GRANTS_DIR = process.env.BALANCE_GRANTS_DIR || path.join(DATA_DIR, 'balance-grants');
const STATE_DIR = process.env.STATE_DIR || path.join(DATA_DIR, 'site-state');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

const PORT = Number(process.env.PORT) || 4173;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;
const BASE_TOTAL_UPGRADES = 13_200;
const MIN_DEPOSIT_TOTAL = 100;

for (const dir of [LOGS_DIR, USER_DB_DIR, path.join(USER_DB_DIR, 'events'), CHATS_DIR, GRANTS_DIR, BALANCE_GRANTS_DIR, STATE_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const userStore = createUserStore({ userDbDir: USER_DB_DIR });
let storageStatus = { ok: false, path: userStore.type === 'supabase' ? 'supabase' : USER_DB_DIR };

async function refreshStorageStatus() {
  storageStatus = await userStore.checkConnection();
}

function sanitizeEmail(email) {
  return email.replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function sendJson(res, status, data) {
  res.status(status).json(data);
}

function isFeedItem(value) {
  return (
    value
    && typeof value.id === 'string'
    && typeof value.username === 'string'
    && typeof value.inputSkin === 'string'
    && typeof value.targetSkin === 'string'
    && (value.inputImage === undefined || typeof value.inputImage === 'string')
    && (value.targetImage === undefined || typeof value.targetImage === 'string')
    && typeof value.probability === 'number'
    && typeof value.won === 'boolean'
    && typeof value.timestamp === 'number'
  );
}

function createInitialState() {
  return {
    feedVersion: FEED_STATE_VERSION,
    feed: Array.from({ length: 24 }, () => createBotFeedItem()),
    totalUpgrades: BASE_TOTAL_UPGRADES,
    playersOnline: 500 + Math.floor(Math.random() * 300) + 1,
    updatedAt: Date.now(),
  };
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    const initial = createInitialState();
    fs.writeFileSync(STATE_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    if (!Array.isArray(parsed.feed) || !parsed.feed.every(isFeedItem)) {
      const initial = createInitialState();
      fs.writeFileSync(STATE_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    if ((parsed.feedVersion ?? 1) < FEED_STATE_VERSION) {
      const initial = createInitialState();
      initial.totalUpgrades = Math.max(
        BASE_TOTAL_UPGRADES,
        Math.floor(parsed.totalUpgrades ?? BASE_TOTAL_UPGRADES),
      );
      initial.playersOnline = Math.max(
        480,
        Math.min(820, Math.floor(parsed.playersOnline ?? 650)),
      );
      fs.writeFileSync(STATE_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    return {
      feedVersion: FEED_STATE_VERSION,
      feed: parsed.feed.slice(0, 40).map(enrichFeedItem),
      totalUpgrades: Math.max(BASE_TOTAL_UPGRADES, Math.floor(parsed.totalUpgrades ?? BASE_TOTAL_UPGRADES)),
      playersOnline: Math.max(480, Math.min(820, Math.floor(parsed.playersOnline ?? 650))),
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    const initial = createInitialState();
    fs.writeFileSync(STATE_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveState(state) {
  const next = {
    feedVersion: FEED_STATE_VERSION,
    feed: state.feed.slice(0, 40),
    totalUpgrades: Math.max(BASE_TOTAL_UPGRADES, Math.floor(state.totalUpgrades)),
    playersOnline: Math.max(480, Math.min(820, Math.floor(state.playersOnline))),
    updatedAt: Date.now(),
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

function appendFeedItem(state, item) {
  const enriched = enrichFeedItem(item);
  return {
    ...state,
    feed: [enriched, ...state.feed.filter(existing => existing.id !== enriched.id)].slice(0, 40),
    totalUpgrades: state.totalUpgrades + 1,
    updatedAt: Date.now(),
  };
}

function driftPlayersOnline(current) {
  const delta = Math.floor(Math.random() * 17) - 8;
  return Math.max(480, Math.min(820, current + delta));
}

function ticketPath(id) {
  return path.join(CHATS_DIR, `${id}.json`);
}

function loadBundle(id) {
  const file = ticketPath(id);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function saveBundle(bundle) {
  fs.writeFileSync(ticketPath(bundle.ticket.id), JSON.stringify(bundle, null, 2), 'utf8');
}

function listTickets(filter) {
  const files = fs.readdirSync(CHATS_DIR).filter(f => f.endsWith('.json'));
  const tickets = [];
  for (const file of files) {
    try {
      const bundle = JSON.parse(fs.readFileSync(path.join(CHATS_DIR, file), 'utf8'));
      if (!bundle?.ticket) continue;
      if (filter?.userId && bundle.ticket.userId !== filter.userId) continue;
      if (filter?.openOnly && bundle.ticket.status !== 'open') continue;
      tickets.push(bundle.ticket);
    } catch {
      /* skip corrupt file */
    }
  }
  return tickets.sort((a, b) => b.updatedAt - a.updatedAt);
}

function countUnreadUserMessages(messages, lastReadAt) {
  return messages.filter(message => message.senderRole === 'user' && message.createdAt > lastReadAt).length;
}

function buildAdminInbox(lastReadByTicket = {}) {
  const tickets = listTickets({ openOnly: true });
  return tickets.map(ticket => {
    const bundle = loadBundle(ticket.id);
    const messages = bundle?.messages ?? [];
    const userMessages = messages.filter(message => message.senderRole === 'user');
    const lastUserMessageAt = userMessages.length
      ? Math.max(...userMessages.map(message => message.createdAt))
      : 0;
    const lastRead = lastReadByTicket[ticket.id] ?? lastUserMessageAt;
    return {
      ticket,
      unreadCount: countUnreadUserMessages(messages, lastRead),
      lastUserMessageAt,
    };
  });
}

function grantsPath(email) {
  return path.join(GRANTS_DIR, `${sanitizeEmail(email)}.json`);
}

function loadGrantStore(email) {
  const normalized = email.trim().toLowerCase();
  const file = grantsPath(normalized);
  if (!fs.existsSync(file)) return { email: normalized, grants: [] };
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!parsed?.grants) return { email: normalized, grants: [] };
    return parsed;
  } catch {
    return { email: normalized, grants: [] };
  }
}

function saveGrantStore(store) {
  fs.writeFileSync(grantsPath(store.email), JSON.stringify(store, null, 2), 'utf8');
}

function balanceGrantsPath(email) {
  return path.join(BALANCE_GRANTS_DIR, `${sanitizeEmail(email)}.json`);
}

function loadBalanceGrantStore(email) {
  const normalized = email.trim().toLowerCase();
  const file = balanceGrantsPath(normalized);
  if (!fs.existsSync(file)) return { email: normalized, grants: [] };
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!parsed?.grants) return { email: normalized, grants: [] };
    return parsed;
  } catch {
    return { email: normalized, grants: [] };
  }
}

function saveBalanceGrantStore(store) {
  fs.writeFileSync(balanceGrantsPath(store.email), JSON.stringify(store, null, 2), 'utf8');
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

function appendUserTxtLog(email, line) {
  const filePath = path.join(LOGS_DIR, `${sanitizeEmail(email)}.txt`);
  if (!fs.existsSync(filePath) && line.startsWith('#')) {
    fs.writeFileSync(filePath, `${line}\n`, 'utf8');
  } else if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      `# Blox Upgrader — ${email}\n# Created: ${new Date().toISOString()}\n\n${line}\n`,
      'utf8',
    );
  } else {
    fs.appendFileSync(filePath, `${line}\n`, 'utf8');
  }
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      userId,
      email,
      passwordHash,
      salt,
      createdAt,
      acceptedAge,
      acceptedTerms,
      nickname,
    } = req.body ?? {};
    if (!userId || !email || !passwordHash || !salt) {
      sendJson(res, 400, { error: 'bad request' });
      return;
    }
    const result = await userStore.registerAccount({
      userId,
      email,
      passwordHash,
      salt,
      createdAt,
      acceptedAge,
      acceptedTerms,
      nickname,
      isNewAccount: true,
    });
    if (result?.line) appendUserTxtLog(email, result.line);
    sendJson(res, 200, { ok: true, user: result?.user ?? null });
  } catch (error) {
    console.error('[auth/register]', error);
    sendJson(res, 500, { error: 'error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { userId, email, nickname } = req.body ?? {};
    if (!userId || !email) {
      sendJson(res, 400, { error: 'bad request' });
      return;
    }
    const result = await userStore.touchAccountLogin({ userId, email, nickname });
    if (result?.line) appendUserTxtLog(email, result.line);
    sendJson(res, 200, { ok: true, user: result?.user ?? null });
  } catch (error) {
    console.error('[auth/login]', error);
    sendJson(res, 500, { error: 'error' });
  }
});

app.post('/api/users/sync', async (req, res) => {
  try {
    const { userId, email, nickname, isNewAccount } = req.body ?? {};
    if (!userId || !email) {
      sendJson(res, 400, { error: 'bad request' });
      return;
    }
    const user = await userStore.upsertUser({ userId, email, nickname, isNewAccount });
    sendJson(res, 200, { ok: true, user });
  } catch (error) {
    console.error('[users/sync]', error);
    sendJson(res, 500, { error: 'error' });
  }
});

app.post('/api/user-log', async (req, res) => {
  try {
    const { userId, email, line, action, details } = req.body ?? {};
    if (!email || typeof line !== 'string') {
      sendJson(res, 400, { error: 'bad request' });
      return;
    }
    appendUserTxtLog(email, line);
    const event = await userStore.appendEvent({ userId, email, line, action, details });
    sendJson(res, 200, { ok: true, eventId: event.id });
  } catch (error) {
    console.error('[user-log]', error);
    sendJson(res, 500, { error: 'error' });
  }
});

app.get('/api/admin/user-db/status', async (req, res) => {
  const adminEmail = String(req.query.adminEmail ?? '');
  if (!userStore.isAdminEmail(adminEmail)) {
    sendJson(res, 403, { error: 'forbidden' });
    return;
  }
  await refreshStorageStatus();
  const users = await userStore.listUsers();
  const emails = await userStore.listRegisteredEmails();
  sendJson(res, 200, {
    storage: storageStatus,
    backend: userStore.type ?? 'file',
    dataDir: userStore.type === 'supabase' ? process.env.SUPABASE_URL : DATA_DIR,
    logsDir: LOGS_DIR,
    userCount: users.length,
    registeredEmailCount: emails.length,
    registeredEmails: emails,
    siteUrl: SITE_URL,
  });
});

app.get('/api/admin/user-db/users', async (req, res) => {
  const adminEmail = String(req.query.adminEmail ?? '');
  if (!userStore.isAdminEmail(adminEmail)) {
    sendJson(res, 403, { error: 'forbidden' });
    return;
  }
  sendJson(res, 200, { users: await userStore.listUsers() });
});

app.get('/api/admin/user-db/users/:userId', async (req, res) => {
  const adminEmail = String(req.query.adminEmail ?? '');
  if (!userStore.isAdminEmail(adminEmail)) {
    sendJson(res, 403, { error: 'forbidden' });
    return;
  }
  const user = await userStore.getUser(req.params.userId);
  if (!user) {
    sendJson(res, 404, { error: 'not found' });
    return;
  }
  sendJson(res, 200, { user, events: await userStore.getUserEvents(req.params.userId) });
});

app.get('/api/admin/user-db/users/:userId/export.txt', async (req, res) => {
  const adminEmail = String(req.query.adminEmail ?? '');
  if (!userStore.isAdminEmail(adminEmail)) {
    sendJson(res, 403, { error: 'forbidden' });
    return;
  }
  if (!(await userStore.getUser(req.params.userId))) {
    sendJson(res, 404, { error: 'not found' });
    return;
  }
  res.type('text/plain; charset=utf-8');
  res.send(await userStore.exportUserTxt(req.params.userId));
});

app.get('/api/site-state', (_req, res) => {
  sendJson(res, 200, loadState());
});

app.post('/api/site-state/feed-event', (req, res) => {
  const body = req.body;
  if (!isFeedItem(body)) {
    sendJson(res, 400, { error: 'invalid feed item' });
    return;
  }
  sendJson(res, 200, saveState(appendFeedItem(loadState(), body)));
});

app.get('/api/inventory-grants', (req, res) => {
  const email = req.query.email?.trim().toLowerCase();
  if (!email) {
    sendJson(res, 400, { error: 'email required' });
    return;
  }
  const store = loadGrantStore(email);
  sendJson(res, 200, { grants: store.grants.filter(g => g.status === 'pending') });
});

app.post('/api/inventory-grants/ack', (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const grantIds = req.body?.grantIds;
  if (!email || !Array.isArray(grantIds)) {
    sendJson(res, 400, { error: 'invalid ack' });
    return;
  }
  const store = loadGrantStore(email);
  const ids = new Set(grantIds);
  store.grants = store.grants.map(g => (ids.has(g.id) ? { ...g, status: 'applied' } : g));
  saveGrantStore(store);
  sendJson(res, 200, { ok: true });
});

app.post('/api/inventory-grants', (req, res) => {
  const targetEmail = req.body?.targetEmail?.trim().toLowerCase();
  const grantedBy = req.body?.grantedBy?.trim().toLowerCase();
  const skin = req.body?.skin;
  if (!targetEmail || !skin?.id || !grantedBy) {
    sendJson(res, 400, { error: 'invalid grant' });
    return;
  }
  const quantity = Math.min(99, Math.max(1, Math.floor(req.body?.quantity ?? 1)));
  const store = loadGrantStore(targetEmail);
  const now = Date.now();
  const grants = Array.from({ length: quantity }, (_, index) => ({
    id: `grant_${now}_${index}_${Math.random().toString(36).slice(2, 8)}`,
    targetEmail,
    grantedBy,
    skin,
    createdAt: now + index,
    status: 'pending',
  }));
  store.grants.push(...grants);
  saveGrantStore(store);
  sendJson(res, 200, { grants, quantity });
});

app.get('/api/balance-grants', (req, res) => {
  const email = req.query.email?.trim().toLowerCase();
  if (!email) {
    sendJson(res, 400, { error: 'email required' });
    return;
  }
  const store = loadBalanceGrantStore(email);
  sendJson(res, 200, { grants: store.grants.filter(g => g.status === 'pending') });
});

app.post('/api/balance-grants/ack', (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const grantIds = req.body?.grantIds;
  if (!email || !Array.isArray(grantIds)) {
    sendJson(res, 400, { error: 'invalid ack' });
    return;
  }
  const store = loadBalanceGrantStore(email);
  const ids = new Set(grantIds);
  store.grants = store.grants.map(g => (ids.has(g.id) ? { ...g, status: 'applied' } : g));
  saveBalanceGrantStore(store);
  sendJson(res, 200, { ok: true });
});

app.post('/api/balance-grants', (req, res) => {
  const targetEmail = req.body?.targetEmail?.trim().toLowerCase();
  const grantedBy = req.body?.grantedBy?.trim().toLowerCase();
  const amount = Number(req.body?.amount);
  if (!targetEmail || !grantedBy || !Number.isFinite(amount) || amount <= 0) {
    sendJson(res, 400, { error: 'invalid grant' });
    return;
  }
  const store = loadBalanceGrantStore(targetEmail);
  const now = Date.now();
  const grant = {
    id: `bal_${now}_${Math.random().toString(36).slice(2, 8)}`,
    targetEmail,
    grantedBy,
    amount: Math.floor(amount),
    createdAt: now,
    status: 'pending',
  };
  store.grants.push(grant);
  saveBalanceGrantStore(store);
  sendJson(res, 200, { grant });
});

app.get('/api/withdraw/tickets', (req, res) => {
  const userId = req.query.userId;
  const admin = req.query.admin === '1';
  const all = req.query.all === '1';
  const tickets = admin
    ? listTickets(all ? undefined : { openOnly: true })
    : listTickets(userId ? { userId } : undefined);
  sendJson(res, 200, { tickets });
});

app.post('/api/withdraw/admin-inbox', (req, res) => {
  const lastReadByTicket = req.body?.lastReadByTicket ?? {};
  sendJson(res, 200, { items: buildAdminInbox(lastReadByTicket) });
});

app.get('/api/withdraw/tickets/:ticketId', (req, res) => {
  const bundle = loadBundle(req.params.ticketId);
  if (!bundle) {
    sendJson(res, 404, { error: 'not found' });
    return;
  }
  sendJson(res, 200, bundle);
});

app.post('/api/withdraw/tickets/:ticketId/messages', (req, res) => {
  const bundle = loadBundle(req.params.ticketId);
  if (!bundle) {
    sendJson(res, 404, { error: 'not found' });
    return;
  }
  const body = req.body ?? {};
  if (!body.text?.trim()) {
    sendJson(res, 400, { error: 'empty message' });
    return;
  }
  const now = Date.now();
  bundle.messages.push({
    id: `msg_${now}_${Math.random().toString(36).slice(2, 7)}`,
    ticketId: req.params.ticketId,
    senderId: body.senderId,
    senderEmail: body.senderEmail,
    senderRole: body.senderRole,
    senderLabel: body.senderLabel || (body.senderRole === 'admin' ? 'Admin' : 'User'),
    text: body.text.trim(),
    createdAt: now,
  });
  bundle.ticket.updatedAt = now;
  saveBundle(bundle);
  sendJson(res, 200, bundle);
});

app.patch('/api/withdraw/tickets/:ticketId', (req, res) => {
  const bundle = loadBundle(req.params.ticketId);
  if (!bundle) {
    sendJson(res, 404, { error: 'not found' });
    return;
  }
  const status = req.body?.status;
  if (!['open', 'completed', 'cancelled'].includes(status)) {
    sendJson(res, 400, { error: 'invalid status' });
    return;
  }
  const now = Date.now();
  bundle.ticket.status = status;
  bundle.ticket.updatedAt = now;
  const ticketType = bundle.ticket.type ?? 'withdraw';
  const statusText = status === 'completed'
    ? ticketType === 'deposit'
      ? 'Deposit completed. The amount has been added to your SALDO.'
      : 'Withdrawal completed. The selected skins have been removed from your inventory.'
    : status === 'cancelled'
      ? ticketType === 'deposit'
        ? 'Deposit request cancelled.'
        : 'Withdrawal request cancelled. Your skins remain in your inventory.'
      : 'Request reopened.';
  bundle.messages.push({
    id: `msg_${now}_sys`,
    ticketId: req.params.ticketId,
    senderId: 'system',
    senderEmail: 'system@blox-upgrader',
    senderRole: 'system',
    senderLabel: 'System',
    text: statusText,
    createdAt: now,
  });
  saveBundle(bundle);
  sendJson(res, 200, bundle);
});

app.post('/api/withdraw/tickets', (req, res) => {
  const body = req.body ?? {};
  if (!body.userId) {
    sendJson(res, 400, { error: 'invalid ticket' });
    return;
  }

  const now = Date.now();
  const ticketType = body.type ?? 'withdraw';

  if (ticketType === 'deposit') {
    const skins = body.skins ?? [];
    const total = skins.reduce((sum, s) => sum + s.price, 0);
    if (!skins.length || !Number.isFinite(total) || total < MIN_DEPOSIT_TOTAL) {
      sendJson(res, 400, { error: 'invalid deposit' });
      return;
    }
    const ticketId = `dp_${now}_${Math.random().toString(36).slice(2, 8)}`;
    const ticket = {
      id: ticketId,
      userId: body.userId,
      userEmail: body.userEmail,
      userLabel: body.userLabel || body.userEmail,
      type: 'deposit',
      skins,
      total,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    const grouped = new Map();
    for (const skin of skins) {
      const existing = grouped.get(skin.id);
      if (existing) existing.qty += 1;
      else grouped.set(skin.id, { name: skin.name, price: skin.price, qty: 1 });
    }
    const skinList = Array.from(grouped.values())
      .map(s => `• ${s.qty > 1 ? `${s.qty}× ` : ''}${s.name} (${(s.price * s.qty).toLocaleString('es-ES')})`)
      .join('\n');
    const bundle = {
      ticket,
      messages: [{
        id: `msg_${now}_welcome`,
        ticketId,
        senderId: 'system',
        senderEmail: 'system@blox-upgrader',
        senderRole: 'system',
        senderLabel: 'System',
        text: `Deposit request received (${total.toLocaleString('es-ES')} coins).\n\n${skinList}\n\nAn administrator will assist you live. Follow their payment instructions here.`,
        createdAt: now,
      }],
    };
    saveBundle(bundle);
    sendJson(res, 200, bundle);
    return;
  }

  if (!body.skins?.length) {
    sendJson(res, 400, { error: 'invalid ticket' });
    return;
  }

  const ticketId = `wd_${now}_${Math.random().toString(36).slice(2, 8)}`;
  const total = body.skins.reduce((sum, s) => sum + s.price, 0);
  const ticket = {
    id: ticketId,
    userId: body.userId,
    userEmail: body.userEmail,
    userLabel: body.userLabel || body.userEmail,
    type: 'withdraw',
    skins: body.skins,
    total,
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };
  const skinList = body.skins.map(s => `• ${s.name} (${s.price.toLocaleString('es-ES')})`).join('\n');
  const bundle = {
    ticket,
    messages: [{
      id: `msg_${now}_welcome`,
      ticketId,
      senderId: 'system',
      senderEmail: 'system@blox-upgrader',
      senderRole: 'system',
      senderLabel: 'System',
      text: `Withdraw request received (${body.skins.length} skins · ${total.toLocaleString('es-ES')}).\n\n${skinList}\n\nAn administrator will assist you live. Please follow their instructions here.`,
      createdAt: now,
    }],
  };
  saveBundle(bundle);
  sendJson(res, 200, bundle);
});

if (!fs.existsSync(DIST)) {
  console.error('[Blox Upgrader] Run "npm run build" before "npm start".');
  process.exit(1);
}

app.use('/assets', express.static(path.join(DIST, 'assets'), {
  maxAge: '1y',
  immutable: true,
}));

app.use(express.static(DIST, { index: false, maxAge: '1h' }));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(DIST, 'index.html'));
});

app.use('/api/*', (_req, res) => {
  sendJson(res, 404, { error: 'not found' });
});

setInterval(() => {
  try {
    const state = loadState();
    saveState({
      ...appendFeedItem(state, createBotFeedItem()),
      playersOnline: driftPlayersOnline(state.playersOnline),
    });
  } catch {
    /* ignore bot tick errors */
  }
}, 3500);

app.listen(PORT, async () => {
  await refreshStorageStatus();
  console.log(`[BloxUpgrader.com] ${SITE_URL}`);
  console.log(`[UserDB] backend=${userStore.type ?? 'file'} path=${storageStatus.path}`);
  console.log(`[UserDB] storage ${storageStatus.ok ? 'OK' : 'FAILED'}${storageStatus.error ? `: ${storageStatus.error}` : ''}`);
});
