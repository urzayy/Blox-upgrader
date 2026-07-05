import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const LOGS_DIR = path.join(ROOT, 'user-logs');
const CHATS_DIR = path.join(ROOT, 'withdraw-chats');
const GRANTS_DIR = path.join(ROOT, 'inventory-grants');
const BALANCE_GRANTS_DIR = path.join(ROOT, 'balance-grants');
const STATE_DIR = path.join(ROOT, 'site-state');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

const PORT = Number(process.env.PORT) || 4173;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;
const BASE_TOTAL_UPGRADES = 13_200;
const FEED_USERS = [
  'NeonPulse', 'xKiller99', 'VortexAce', 'CyberWolf', 'BladeRunner',
  'GhostOps', 'TitanSlayer', 'NovaStrike', 'IronFist', 'DarkMatter',
];
const FEED_SKINS = [
  'AK-47 | Redline', 'AWP | Asiimov', 'M4A4 | Howl', 'Karambit | Fade',
  'Glock-18 | Fade', 'USP-S | Kill Confirmed', 'Desert Eagle | Blaze',
  'Butterfly Knife | Doppler', 'AWP | Dragon Lore', 'M9 Bayonet | Tiger Tooth',
];

for (const dir of [LOGS_DIR, CHATS_DIR, GRANTS_DIR, BALANCE_GRANTS_DIR, STATE_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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
    && typeof value.probability === 'number'
    && typeof value.won === 'boolean'
    && typeof value.timestamp === 'number'
  );
}

function createBotFeedItem() {
  const inputSkin = FEED_SKINS[Math.floor(Math.random() * FEED_SKINS.length)];
  let targetSkin = FEED_SKINS[Math.floor(Math.random() * FEED_SKINS.length)];
  if (targetSkin === inputSkin) {
    targetSkin = FEED_SKINS[(FEED_SKINS.indexOf(inputSkin) + 1) % FEED_SKINS.length];
  }
  const won = Math.random() < 0.76;
  return {
    id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    username: FEED_USERS[Math.floor(Math.random() * FEED_USERS.length)],
    inputSkin,
    targetSkin,
    probability: Math.round((won ? 32 + Math.random() * 38 : 8 + Math.random() * 20) * 10) / 10,
    won,
    timestamp: Date.now(),
  };
}

function createInitialState() {
  return {
    feed: Array.from({ length: 24 }, createBotFeedItem),
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
    return {
      feed: parsed.feed.slice(0, 40),
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
    feed: state.feed.slice(0, 40),
    totalUpgrades: Math.max(BASE_TOTAL_UPGRADES, Math.floor(state.totalUpgrades)),
    playersOnline: Math.max(480, Math.min(820, Math.floor(state.playersOnline))),
    updatedAt: Date.now(),
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

function appendFeedItem(state, item) {
  return {
    ...state,
    feed: [item, ...state.feed.filter(existing => existing.id !== item.id)].slice(0, 40),
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

app.post('/api/user-log', (req, res) => {
  try {
    const { email, line } = req.body ?? {};
    if (!email || typeof line !== 'string') {
      sendJson(res, 400, { error: 'bad request' });
      return;
    }
    const filePath = path.join(LOGS_DIR, `${sanitizeEmail(email)}.txt`);
    if (!fs.existsSync(filePath) && line.startsWith('#')) {
      fs.writeFileSync(filePath, `${line}\n`, 'utf8');
    } else if (!fs.existsSync(filePath)) {
      fs.writeFileSync(
        filePath,
        `# Blox Upgrader — ${email}\n# Creado: ${new Date().toISOString()}\n\n${line}\n`,
        'utf8',
      );
    } else {
      fs.appendFileSync(filePath, `${line}\n`, 'utf8');
    }
    sendJson(res, 200, { ok: true });
  } catch {
    sendJson(res, 500, { error: 'error' });
  }
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
    if (!skins.length || !Number.isFinite(total) || total <= 0) {
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

app.use(express.static(DIST, { index: false, maxAge: '1d' }));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
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

app.listen(PORT, () => {
  console.log(`[BloxUpgrader.com] ${SITE_URL}`);
});
