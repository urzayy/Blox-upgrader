import fs from 'node:fs';
import path from 'node:path';
import { createGiveawayParticipantsStore } from './giveawayParticipants.mjs';
import { createGiveawayWinnersStore, pickWeightedWinner } from './giveawayWinners.mjs';
import { createInventoryGrantStore } from './inventoryGrantStore.mjs';

const PERIODS = ['daily', 'weekly', 'monthly'];
const DAY_MS = 24 * 60 * 60 * 1000;

const PERIOD_DAYS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

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

function emptySlot(period) {
  return {
    period,
    status: 'closed',
    skin: null,
    depositRequirement: 0,
    startedAt: null,
    endsAt: null,
    participants: 0,
    openedBy: null,
    closedAt: null,
  };
}

function normalizeDeposit(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function normalizeSlot(raw, period) {
  const base = emptySlot(period);
  if (!raw || typeof raw !== 'object') return base;

  const status = raw.status === 'active' ? 'active' : 'closed';
  const skin = isSkin(raw.skin) ? raw.skin : null;
  const endsAt = typeof raw.endsAt === 'number' ? raw.endsAt : null;
  const startedAt = typeof raw.startedAt === 'number' ? raw.startedAt : null;
  const now = Date.now();

  if (status === 'active' && endsAt != null && endsAt <= now) {
    return {
      ...base,
      status: 'closed',
      skin,
      depositRequirement: normalizeDeposit(raw.depositRequirement),
      startedAt,
      endsAt,
      participants: Math.max(0, Math.floor(Number(raw.participants ?? 0))),
      openedBy: typeof raw.openedBy === 'string' ? raw.openedBy : null,
      closedAt: now,
    };
  }

  return {
    period,
    status: status === 'active' && skin && endsAt ? 'active' : 'closed',
    skin,
    depositRequirement: normalizeDeposit(raw.depositRequirement),
    startedAt,
    endsAt: status === 'active' ? endsAt : null,
    participants: Math.max(0, Math.floor(Number(raw.participants ?? 0))),
    openedBy: typeof raw.openedBy === 'string' ? raw.openedBy : null,
    closedAt: typeof raw.closedAt === 'number' ? raw.closedAt : null,
  };
}

export function createGiveawayStore(giveawaysDir, grantsDir = null) {
  const filePath = path.join(giveawaysDir, 'state.json');
  const participantsStore = createGiveawayParticipantsStore(giveawaysDir);
  const winnersStore = createGiveawayWinnersStore(giveawaysDir);
  const inventoryGrants = grantsDir ? createInventoryGrantStore(grantsDir) : null;

  function ensureDir() {
    if (!fs.existsSync(giveawaysDir)) fs.mkdirSync(giveawaysDir, { recursive: true });
  }

  function loadRaw() {
    ensureDir();
    if (!fs.existsSync(filePath)) {
      const initial = {
        version: 1,
        giveaways: Object.fromEntries(PERIODS.map(period => [period, emptySlot(period)])),
      };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return parsed && typeof parsed === 'object' ? parsed : { version: 1, giveaways: {} };
    } catch {
      return { version: 1, giveaways: {} };
    }
  }

  function saveRaw(data) {
    ensureDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  function enrichSlot(slot) {
    const count = participantsStore.getParticipantCount(slot.period);
    return {
      ...slot,
      participants: count,
      totalEntries: participantsStore.getTotalEntries(slot.period),
    };
  }

  function getAll(now = Date.now()) {
    const raw = loadRaw();
    let changed = false;
    const giveaways = {};
    for (const period of PERIODS) {
      let slot = normalizeSlot(raw.giveaways?.[period], period);
      if (slot.status === 'active' && slot.endsAt != null && slot.endsAt <= now) {
        slot = { ...slot, status: 'closed', closedAt: now };
        changed = true;
      }
      giveaways[period] = enrichSlot(slot);
    }
    if (changed) persistAll(giveaways);
    return { giveaways };
  }

  function persistAll(giveaways) {
    saveRaw({ version: 1, giveaways });
    return { giveaways };
  }

  function openGiveaway({ period, skin, depositRequirement, openedBy }) {
    if (!PERIODS.includes(period)) {
      return { error: 'invalid_period' };
    }
    if (!isSkin(skin)) {
      return { error: 'invalid_skin' };
    }

    const now = Date.now();
    const days = PERIOD_DAYS[period] ?? 1;
    const current = getAll(now).giveaways;
    current[period] = {
      period,
      status: 'active',
      skin,
      depositRequirement: normalizeDeposit(depositRequirement),
      startedAt: now,
      endsAt: now + days * DAY_MS,
      participants: 0,
      openedBy: String(openedBy ?? '').trim().toLowerCase() || null,
      closedAt: null,
    };

    participantsStore.clearPeriod(period);

    return { ok: true, giveaway: enrichSlot(persistAll(current).giveaways[period]) };
  }

  function closeGiveaway({ period, pickWinner = false, grantedBy = 'giveaway@bloxupgrader.com' }) {
    if (!PERIODS.includes(period)) {
      return { error: 'invalid_period' };
    }

    const now = Date.now();
    const current = getAll(now).giveaways;
    const existing = current[period] ?? emptySlot(period);
    if (existing.status !== 'active') {
      return { error: 'giveaway_not_active' };
    }

    let winner = null;
    let grantError = null;

    if (pickWinner) {
      const participants = participantsStore.listParticipants(period);
      const picked = pickWeightedWinner(participants);
      if (!picked) {
        return { error: 'no_eligible_winner' };
      }
      if (!existing.skin) {
        return { error: 'missing_prize_skin' };
      }
      if (!inventoryGrants) {
        return { error: 'grants_unavailable' };
      }

      const grantResult = inventoryGrants.createPendingGrant({
        targetEmail: picked.email,
        grantedBy: String(grantedBy ?? 'giveaway@bloxupgrader.com').trim().toLowerCase(),
        skin: existing.skin,
        quantity: 1,
      });
      if (grantResult.error) {
        return { error: grantResult.error };
      }

      const winnerRecord = winnersStore.addWinner({
        period,
        skin: existing.skin,
        winnerUserId: picked.userId,
        winnerEmail: picked.email,
        winnerNickname: picked.nickname,
      });
      if (winnerRecord.error) {
        return { error: winnerRecord.error };
      }

      winnersStore.queuePendingWin({
        userId: picked.userId,
        period,
        skin: existing.skin,
      });

      winner = {
        userId: picked.userId,
        email: picked.email,
        nickname: picked.nickname,
        entries: picked.entries,
        skin: existing.skin,
      };
    }

    current[period] = {
      ...existing,
      status: 'closed',
      endsAt: existing.endsAt ?? now,
      closedAt: now,
    };

    return {
      ok: true,
      giveaway: enrichSlot(persistAll(current).giveaways[period]),
      winner,
      grantError,
    };
  }

  function listWinners(limit = 24) {
    return { winners: winnersStore.listWinners(limit) };
  }

  function listPendingWins(userId) {
    return { pending: winnersStore.listPendingForUser(userId) };
  }

  function ackPendingWin(userId, pendingId) {
    const result = winnersStore.ackPending(userId, pendingId);
    if (result.error) return result;
    return { ok: true };
  }

  function getDetail(period, userId = null) {
    if (!PERIODS.includes(period)) return { error: 'invalid_period' };
    const all = getAll();
    const slot = all.giveaways[period];
    const participants = participantsStore.listParticipants(period);
    const totalEntries = participantsStore.getTotalEntries(period);
    const me = userId ? participantsStore.getParticipant(period, userId) : null;
    const myChance = me && totalEntries > 0
      ? (me.entries / totalEntries) * 100
      : 0;

    return {
      giveaway: slot,
      participants,
      totalEntries,
      me,
      myChance,
      coinsPerEntry: participantsStore.GIVEAWAY_COINS_PER_ENTRY,
    };
  }

  function joinGiveaway(period, payload) {
    const all = getAll();
    const slot = all.giveaways[period];
    if (!slot || slot.status !== 'active') return { error: 'giveaway_closed' };
    return { error: 'deposit_required' };
  }

  function recordUserDeposit(userId, amount, profile = {}) {
    const all = getAll();
    const activePeriods = PERIODS.filter(period => all.giveaways[period]?.status === 'active');
    return participantsStore.recordDepositForActive(activePeriods, userId, amount, profile);
  }

  return {
    getAll,
    getDetail,
    joinGiveaway,
    recordUserDeposit,
    openGiveaway,
    closeGiveaway,
    listWinners,
    listPendingWins,
    ackPendingWin,
    PERIOD_DAYS,
  };
}
