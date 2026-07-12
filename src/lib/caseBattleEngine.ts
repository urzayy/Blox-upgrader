import type { CaseBattle, BattlePendingRound } from './caseBattles';
import { getCaseBattleById, isBattleParticipant } from './caseBattles';
import { trySettleBattleEconomy } from './caseBattleEconomy';
import {
  applyBattleRoundResults,
  canStartBattle,
  startBattle,
} from './caseBattleRuntime';
import {
  loadLiveBattles,
  removeLiveBattle,
  updateLiveBattle,
  notifyBattlesUpdated,
  BATTLE_FINISH_GRACE_MS,
  startCaseBattlesServerSync,
} from './caseBattlesStorage';
import { buildFreeCaseReel } from './freeCaseReel';
import { createGrantedFreeCaseSkin, pickFreeCaseReward } from './freeCaseOpen';

export const BATTLE_ROUND_INTRO_MS = 500;
export const BATTLE_ROUND_ROLL_MS = 4800;
export const BATTLE_ROUND_ROYAL_HOLD_MS = 1200;
export const BATTLE_ROUND_REVEAL_HOLD_MS = 1500;
export const BATTLE_ROUND_TOTAL_MS =
  BATTLE_ROUND_INTRO_MS + BATTLE_ROUND_ROLL_MS + BATTLE_ROUND_REVEAL_HOLD_MS;

export function getBattleRoundDurationMs(
  sessions: Array<{ result: { isRoyalSpin?: boolean; royalReel?: unknown } }>,
): number {
  const hasRoyal = sessions.some(
    session => session.result.isRoyalSpin && session.result.royalReel,
  );

  if (!hasRoyal) return BATTLE_ROUND_TOTAL_MS;

  return (
    BATTLE_ROUND_INTRO_MS
    + BATTLE_ROUND_ROLL_MS
    + BATTLE_ROUND_ROYAL_HOLD_MS
    + BATTLE_ROUND_ROLL_MS
    + BATTLE_ROUND_REVEAL_HOLD_MS
  );
}

const TICK_MS = 400;

function createPendingRound(battle: CaseBattle): BattlePendingRound | null {
  const slug = battle.caseSlugs[battle.currentRound];
  if (!slug) return null;

  const joker = battle.jokerFlags[battle.currentRound] ?? false;
  const startedAt = Date.now();

  const sessions = battle.players.flatMap(player => {
    const reward = pickFreeCaseReward(slug, { joker });
    if (!reward) return [];

    const grantedSkin = createGrantedFreeCaseSkin(reward);
    const result = buildFreeCaseReel(slug, reward, undefined, { joker });

    return [{ playerId: player.id, result, grantedSkin }];
  });

  if (sessions.length === 0) return null;

  const roundDurationMs = getBattleRoundDurationMs(sessions);

  return {
    roundIndex: battle.currentRound,
    startedAt,
    applyAt: startedAt + roundDurationMs,
    slug,
    joker,
    dropsByPlayerId: Object.fromEntries(
      sessions.map(session => [session.playerId, session.grantedSkin]),
    ),
    sessions,
  };
}

let tickIntervalId: number | null = null;
const finishRemovalTimers = new Map<string, number>();
let activeUserId: string | undefined;

function scheduleFinishedBattleRemoval(battle: CaseBattle): void {
  if (finishRemovalTimers.has(battle.id)) return;

  const finishedAt = battle.finishedAt ?? Date.now();
  const delay = Math.max(0, finishedAt + BATTLE_FINISH_GRACE_MS - Date.now());

  const timer = window.setTimeout(() => {
    removeLiveBattle(battle.id);
    finishRemovalTimers.delete(battle.id);
    notifyBattlesUpdated();
  }, delay);

  finishRemovalTimers.set(battle.id, timer);
}

function tickBattles(): void {
  const userId = activeUserId;
  const battles = loadLiveBattles();

  for (const battle of battles) {
    if (!userId || battle.createdByUserId !== userId) continue;

    if (canStartBattle(battle)) {
      updateLiveBattle(battle.id, startBattle);
      continue;
    }

    if (
      battle.status === 'in_progress'
      && !battle.pendingRound
      && battle.currentRound < battle.caseSlugs.length
    ) {
      const pendingRound = createPendingRound(battle);
      if (pendingRound) {
        updateLiveBattle(battle.id, current => ({ ...current, pendingRound }));
      }
      continue;
    }

    if (
      battle.status === 'in_progress'
      && battle.pendingRound
      && Date.now() >= battle.pendingRound.applyAt
    ) {
      updateLiveBattle(battle.id, current => {
        if (!current.pendingRound || Date.now() < current.pendingRound.applyAt) {
          return current;
        }

        const applied = applyBattleRoundResults(
          current,
          current.pendingRound.dropsByPlayerId,
        );
        return { ...applied, pendingRound: undefined };
      });
      continue;
    }

    if (battle.status === 'finished') {
      if (userId && isBattleParticipant(battle, userId)) {
        const fresh = getCaseBattleById(battle.id) ?? battle;
        trySettleBattleEconomy(fresh, userId);
      }
      scheduleFinishedBattleRemoval(battle);
    }
  }
}

export function startCaseBattleEngine(userId: string | undefined): () => void {
  activeUserId = userId;

  if (tickIntervalId != null) {
    return stopCaseBattleEngine;
  }

  const runTick = () => tickBattles();
  runTick();
  tickIntervalId = window.setInterval(runTick, TICK_MS);

  return stopCaseBattleEngine;
}

export function stopCaseBattleEngine(): void {
  if (tickIntervalId != null) {
    window.clearInterval(tickIntervalId);
    tickIntervalId = null;
  }

  finishRemovalTimers.forEach(timer => window.clearTimeout(timer));
  finishRemovalTimers.clear();
}

export function bootstrapCaseBattleEngine(userId: string | undefined): () => void {
  const stopSync = startCaseBattlesServerSync(1500);
  const stopEngine = startCaseBattleEngine(userId);

  return () => {
    stopSync();
    stopEngine();
  };
}
