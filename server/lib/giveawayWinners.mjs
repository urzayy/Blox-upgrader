import fs from 'node:fs';
import path from 'node:path';

const MAX_WINNERS = 60;
const MAX_PENDING = 200;

function isSkin(value) {
  return (
    value
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.weapon === 'string'
    && typeof value.rarity === 'string'
    && typeof value.wear === 'string'
    && typeof value.price === 'number'
    && typeof value.image === 'string'
  );
}

function normalizeWinner(raw) {
  if (!raw || typeof raw !== 'object' || !isSkin(raw.skin)) return null;
  return {
    id: typeof raw.id === 'string' ? raw.id : `win_${Date.now()}`,
    period: typeof raw.period === 'string' ? raw.period : 'daily',
    skin: raw.skin,
    winnerUserId: typeof raw.winnerUserId === 'string' ? raw.winnerUserId : '',
    winnerEmail: typeof raw.winnerEmail === 'string' ? raw.winnerEmail.trim().toLowerCase() : '',
    winnerNickname: typeof raw.winnerNickname === 'string' ? raw.winnerNickname.trim() : '',
    wonAt: typeof raw.wonAt === 'number' ? raw.wonAt : Date.now(),
  };
}

function normalizePending(raw) {
  if (!raw || typeof raw !== 'object' || !isSkin(raw.skin)) return null;
  return {
    id: typeof raw.id === 'string' ? raw.id : `pending_${Date.now()}`,
    userId: typeof raw.userId === 'string' ? raw.userId : '',
    period: typeof raw.period === 'string' ? raw.period : 'daily',
    skin: raw.skin,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    acked: Boolean(raw.acked),
  };
}

export function createGiveawayWinnersStore(giveawaysDir) {
  const filePath = path.join(giveawaysDir, 'winners.json');

  function ensureDir() {
    if (!fs.existsSync(giveawaysDir)) fs.mkdirSync(giveawaysDir, { recursive: true });
  }

  function loadRaw() {
    ensureDir();
    if (!fs.existsSync(filePath)) {
      const initial = { version: 1, winners: [], pending: [] };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return parsed && typeof parsed === 'object'
        ? parsed
        : { version: 1, winners: [], pending: [] };
    } catch {
      return { version: 1, winners: [], pending: [] };
    }
  }

  function saveRaw(data) {
    ensureDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  function listWinners(limit = 24) {
    const raw = loadRaw();
    return (Array.isArray(raw.winners) ? raw.winners : [])
      .map(normalizeWinner)
      .filter(Boolean)
      .sort((a, b) => b.wonAt - a.wonAt)
      .slice(0, Math.max(1, Math.min(limit, MAX_WINNERS)));
  }

  function addWinner(entry) {
    const raw = loadRaw();
    const winner = normalizeWinner({
      id: `win_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...entry,
      wonAt: Date.now(),
    });
    if (!winner) return { error: 'invalid_winner' };
    raw.winners = [winner, ...(Array.isArray(raw.winners) ? raw.winners : [])]
      .map(normalizeWinner)
      .filter(Boolean)
      .slice(0, MAX_WINNERS);
    saveRaw(raw);
    return { ok: true, winner };
  }

  function queuePendingWin(entry) {
    const raw = loadRaw();
    const pending = normalizePending({
      id: `pending_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...entry,
      createdAt: Date.now(),
      acked: false,
    });
    if (!pending) return { error: 'invalid_pending' };
    raw.pending = [pending, ...(Array.isArray(raw.pending) ? raw.pending : [])]
      .map(normalizePending)
      .filter(Boolean)
      .slice(0, MAX_PENDING);
    saveRaw(raw);
    return { ok: true, pending };
  }

  function listPendingForUser(userId) {
    const id = String(userId ?? '').trim();
    if (!id) return [];
    const raw = loadRaw();
    return (Array.isArray(raw.pending) ? raw.pending : [])
      .map(normalizePending)
      .filter(Boolean)
      .filter(item => item.userId === id && !item.acked);
  }

  function ackPending(userId, pendingId) {
    const id = String(userId ?? '').trim();
    const pending = String(pendingId ?? '').trim();
    if (!id || !pending) return { error: 'invalid_ack' };
    const raw = loadRaw();
    let found = false;
    raw.pending = (Array.isArray(raw.pending) ? raw.pending : []).map(item => {
      const normalized = normalizePending(item);
      if (!normalized) return item;
      if (normalized.userId === id && normalized.id === pending) {
        found = true;
        return { ...normalized, acked: true };
      }
      return normalized;
    });
    if (!found) return { error: 'not_found' };
    saveRaw(raw);
    return { ok: true };
  }

  return {
    listWinners,
    addWinner,
    queuePendingWin,
    listPendingForUser,
    ackPending,
  };
}

export function pickWeightedWinner(participants) {
  const eligible = participants.filter(p => p.entries > 0);
  if (!eligible.length) return null;
  const total = eligible.reduce((sum, p) => sum + p.entries, 0);
  let roll = Math.random() * total;
  for (const participant of eligible) {
    roll -= participant.entries;
    if (roll <= 0) return participant;
  }
  return eligible[eligible.length - 1];
}
