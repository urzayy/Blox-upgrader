import type { BattlePlayer, CaseBattle } from './caseBattles';
import { battleLoanSharePercent } from './caseBattleCreate';
import { getBattleSideTotals, resolvePlayerSide, type BattleSide } from './battleSides';
export interface BattlePlayerOutcome {
  isWinner: boolean;
  winnings: number;
  loanPaid?: number;
}

function battlePot(battle: CaseBattle): number {
  return battle.players.reduce((sum, player) => sum + (player.totalValue ?? 0), 0);
}

function isTeamFormat(battle: CaseBattle): boolean {
  return battle.format === '2v2' || battle.format === '3v3' || battle.format === '2v2v2';
}

function winningSideClassic(battle: CaseBattle): BattleSide | null {
  const totals = getBattleSideTotals(battle.players, battle.maxPlayers);
  if (totals['counter-terrorist'] === totals.terrorist) return null;
  return totals['counter-terrorist'] > totals.terrorist ? 'counter-terrorist' : 'terrorist';
}

function winningSideUnderdog(battle: CaseBattle): BattleSide | null {
  const totals = getBattleSideTotals(battle.players, battle.maxPlayers);
  if (totals['counter-terrorist'] === totals.terrorist) return null;
  return totals['counter-terrorist'] < totals.terrorist ? 'counter-terrorist' : 'terrorist';
}

function winningPlayerIdsClassic(battle: CaseBattle): Set<string> {
  if (isTeamFormat(battle)) {
    const winningSide =
      battle.mode === 'underdog' ? winningSideUnderdog(battle) : winningSideClassic(battle);
    if (!winningSide) return new Set();

    return new Set(
      battle.players
        .filter((player, index) =>
          resolvePlayerSide(player, player.slotIndex ?? index, battle.maxPlayers) === winningSide,
        )
        .map(player => player.id),
    );
  }

  const ranked = [...battle.players].sort(
    (left, right) => (right.totalValue ?? 0) - (left.totalValue ?? 0),
  );
  const bestValue = ranked[0]?.totalValue ?? 0;
  const mode = battle.mode;

  if (mode === 'underdog') {
    const worst = [...battle.players].sort(
      (left, right) => (left.totalValue ?? 0) - (right.totalValue ?? 0),
    );
    const lowValue = worst[0]?.totalValue ?? 0;
    return new Set(worst.filter(player => (player.totalValue ?? 0) === lowValue).map(p => p.id));
  }

  if (mode === 'share') {
    return new Set(battle.players.map(player => player.id));
  }

  return new Set(
    ranked.filter(player => (player.totalValue ?? 0) === bestValue).map(player => player.id),
  );
}

function applyLoanToWinnings(battle: CaseBattle, player: BattlePlayer, grossWinnings: number): number {
  if (!battle.loanMode || player.isBot || grossWinnings <= 0) return grossWinnings;
  return Math.round((grossWinnings * battleLoanSharePercent(battle.loanPercent)) / 100);
}

function winningsForPlayer(
  battle: CaseBattle,
  player: BattlePlayer,
  winnerIds: Set<string>,
): number {
  const pot = battlePot(battle);
  if (pot <= 0) return 0;

  if (battle.mode === 'share') {
    const gross = pot / Math.max(1, battle.players.length);
    return applyLoanToWinnings(battle, player, gross);
  }

  if (!winnerIds.has(player.id)) return 0;

  const winnerCount = winnerIds.size;
  const gross = pot / Math.max(1, winnerCount);

  return applyLoanToWinnings(battle, player, gross);
}

function loanPaidForPlayer(battle: CaseBattle, player: BattlePlayer): number | undefined {
  if (!battle.loanMode || player.isBot) return undefined;
  return battle.cost;
}
export function getBattleLeadingPlayerIds(battle: CaseBattle): Set<string> {
  if (battle.mode === 'share') return new Set();
  return winningPlayerIdsClassic(battle);
}

export function getBattleWinnerIds(battle: CaseBattle): Set<string> {
  return winningPlayerIdsClassic(battle);
}

export function resolveBattleOutcomes(battle: CaseBattle): Map<string, BattlePlayerOutcome> {
  const winnerIds = winningPlayerIdsClassic(battle);
  const outcomes = new Map<string, BattlePlayerOutcome>();

  battle.players.forEach(player => {
    const isWinner = winnerIds.has(player.id);
    outcomes.set(player.id, {
      isWinner,
      winnings: winningsForPlayer(battle, player, winnerIds),
      loanPaid: isWinner ? loanPaidForPlayer(battle, player) : undefined,
    });
  });

  return outcomes;
}

export function getBattleOutcomeForPlayer(
  battle: CaseBattle,
  playerId: string,
): BattlePlayerOutcome | undefined {
  return resolveBattleOutcomes(battle).get(playerId);
}
