import { getCaseBattleById, isBattleParticipant, type CaseBattle } from './caseBattles';
import { resolveBattleOutcomes } from './caseBattleOutcome';
import { updateLiveBattle } from './caseBattlesStorage';
import { requestGrantBalance, requestSyncPlayerState } from './uiActions';

export function isUserBattleEconomySettled(battle: CaseBattle, userId: string): boolean {
  if (battle.settledUserIds?.includes(userId)) return true;
  return Boolean(battle.economySettled);
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
    return {
      ...current,
      settledUserIds: [...settled],
      economySettled: true,
    };
  });

  return Boolean(saved);
}

export function trySettleBattleEconomy(battle: CaseBattle, userId: string): boolean {
  if (battle.status !== 'finished') return false;
  if (!isBattleParticipant(battle, userId)) return false;

  const freshBattle = getCaseBattleById(battle.id) ?? battle;
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
