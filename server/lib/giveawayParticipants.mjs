import fs from 'node:fs';
import path from 'node:path';

const PERIODS = ['daily', 'weekly', 'monthly'];
export const GIVEAWAY_COINS_PER_ENTRY = 200;

function calcEntries(totalDeposited) {
  const deposited = Math.max(0, Math.floor(Number(totalDeposited) || 0));
  return Math.floor(deposited / GIVEAWAY_COINS_PER_ENTRY);
}

function normalizeAvatarId(value) {
  return value === 1 || value === 2 || value === 3 ? value : 1;
}

function normalizeParticipant(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const userId = typeof raw.userId === 'string' ? raw.userId : '';
  if (!userId) return null;
  const totalDeposited = Math.max(0, Math.floor(Number(raw.totalDeposited) || 0));
  if (totalDeposited <= 0) return null;
  return {
    userId,
    email: typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '',
    nickname: typeof raw.nickname === 'string' ? raw.nickname.trim() : '',
    avatarId: normalizeAvatarId(raw.avatarId),
    totalDeposited,
    entries: calcEntries(totalDeposited),
    joinedAt: typeof raw.joinedAt === 'number' ? raw.joinedAt : Date.now(),
  };
}

export function createGiveawayParticipantsStore(giveawaysDir) {
  const filePath = path.join(giveawaysDir, 'participants.json');

  function ensureDir() {
    if (!fs.existsSync(giveawaysDir)) fs.mkdirSync(giveawaysDir, { recursive: true });
  }

  function loadRaw() {
    ensureDir();
    if (!fs.existsSync(filePath)) {
      const initial = { version: 1, byPeriod: {} };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return parsed && typeof parsed === 'object' ? parsed : { version: 1, byPeriod: {} };
    } catch {
      return { version: 1, byPeriod: {} };
    }
  }

  function saveRaw(data) {
    ensureDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  function getPeriodMap(raw, period) {
    if (!raw.byPeriod || typeof raw.byPeriod !== 'object') raw.byPeriod = {};
    if (!raw.byPeriod[period] || typeof raw.byPeriod[period] !== 'object') {
      raw.byPeriod[period] = {};
    }
    return raw.byPeriod[period];
  }

  function listParticipants(period) {
    if (!PERIODS.includes(period)) return [];
    const raw = loadRaw();
    const map = getPeriodMap(raw, period);
    return Object.values(map)
      .map(normalizeParticipant)
      .filter(Boolean)
      .sort((a, b) => a.joinedAt - b.joinedAt);
  }

  function getParticipant(period, userId) {
    if (!PERIODS.includes(period) || !userId) return null;
    const raw = loadRaw();
    const map = getPeriodMap(raw, period);
    return normalizeParticipant(map[userId]);
  }

  function getParticipantCount(period) {
    return listParticipants(period).length;
  }

  function getTotalEntries(period) {
    return listParticipants(period).reduce((sum, p) => sum + p.entries, 0);
  }

  function clearPeriod(period) {
    if (!PERIODS.includes(period)) return;
    const raw = loadRaw();
    raw.byPeriod[period] = {};
    saveRaw(raw);
  }

  function enrollAndRecordDeposit(period, userId, amount, profile = {}) {
    if (!PERIODS.includes(period)) return { error: 'invalid_period' };
    const id = String(userId ?? '').trim();
    const depositAmount = Math.max(0, Math.floor(Number(amount) || 0));
    if (!id || depositAmount <= 0) return { error: 'invalid_payload' };

    const raw = loadRaw();
    const map = getPeriodMap(raw, period);
    const existing = normalizeParticipant(map[id]);
    const totalDeposited = (existing?.totalDeposited ?? 0) + depositAmount;
    const participant = {
      userId: id,
      email: existing?.email || String(profile.email ?? '').trim().toLowerCase(),
      nickname: existing?.nickname || String(profile.nickname ?? '').trim(),
      avatarId: normalizeAvatarId(existing?.avatarId ?? profile.avatarId),
      totalDeposited,
      entries: calcEntries(totalDeposited),
      joinedAt: existing?.joinedAt ?? Date.now(),
    };
    map[id] = participant;
    saveRaw(raw);
    return { ok: true, participant };
  }

  function recordDepositForActive(periods, userId, amount, profile = {}) {
    const results = [];
    for (const period of periods) {
      const result = enrollAndRecordDeposit(period, userId, amount, profile);
      if (result.ok) results.push({ period, participant: result.participant });
    }
    return results;
  }

  return {
    GIVEAWAY_COINS_PER_ENTRY,
    listParticipants,
    getParticipant,
    getParticipantCount,
    getTotalEntries,
    clearPeriod,
    enrollAndRecordDeposit,
    recordDepositForActive,
    calcEntries,
  };
}
