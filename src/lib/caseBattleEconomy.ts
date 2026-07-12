import { getCaseBattleById, isBattleParticipant, type CaseBattle } from './caseBattles';
import { resolveBattleOutcomes } from './caseBattleOutcome';
import { updateLiveBattle } from './caseBattlesStorage';
import { requestGrantBalance, requestSyncPlayerState } from './uiActions';

function humanPlayerIds(battle: CaseBattle): string[] {
  return battle.players.filter(player => !player.isBot).map(player => player.id);
}

export function areAllHumanPlayersSettled(battle: CaseBattle): boolean {
  const humans = humanPlayerIds(battle);
  if (humans.length === 0) return true;
  const settled = new Set(battle.settledUserIds ?? []);
  return humans.every(id => settled.has(id));
}

export function isUserBattleEconomySettled(battle: CaseBattle, userId: string): boolean {
  return battle.settledUserIds?.includes(userId) ?? false;
}

export function getBattleRewardBalanceForUser(battle: CaseBattle, userId: string): number {
  const humanPlayer = battle.players.find(player => !player.isBot && player.id === userId);
  if (!humanPlayer) return 0;

  const outcome = resolveBattleOutcomes(battle).get(humanPlayer.id);
  if (!outcome) return 0;

  if (battle.mode === 'share') {
    return Math.max(0, outcome.winnings);
  }

  if (!outcome.isWinner) return 0;
  return Math.max(0, outcome.winnings);
}

function markUserBattleSettled(battleId: string, userId: string): boolean {
  const saved = updateLiveBattle(battleId, current => {
    const settled = new Set(current.settledUserIds ?? []);
    if (settled.has(userId)) return current;
    settled.add(userId);
    const settledUserIds = [...settled];
    return {
      ...current,
      settledUserIds,
      economySettled: areAllHumanPlayersSettled({ ...current, settledUserIds }),
    };
  });

  return Boolean(saved);
}

function pickSettlementBattle(battle: CaseBattle): CaseBattle {
  const cached = getCaseBattleById(battle.id);
  if (!cached) return battle;

  const cachedPot = cached.players.reduce((sum, player) => sum + (player.totalValue ?? 0), 0);
  const battlePot = battle.players.reduce((sum, player) => sum + (player.totalValue ?? 0), 0);
  return battlePot >= cachedPot ? battle : cached;
}

export function trySettleBattleEconomy(battle: CaseBattle, userId: string): boolean {
  if (battle.status !== 'finished') return false;
  if (!isBattleParticipant(battle, userId)) return false;

  const freshBattle = pickSettlementBattle(battle);
  if (isUserBattleEconomySettled(freshBattle, userId)) return false;

  const winnings = getBattleRewardBalanceForUser(freshBattle, userId);

  if (winnings > 0) {
    const potReady = freshBattle.players.some(player => (player.totalValue ?? 0) > 0);
    if (!potReady) return false;

    const granted = requestGrantBalance(winnings);
    if (!granted) return false;
    requestSyncPlayerState();
  }

  return markUserBattleSettled(freshBattle.id, userId);
}
