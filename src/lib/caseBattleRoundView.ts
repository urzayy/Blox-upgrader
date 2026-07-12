import type { BattlePendingRound } from './caseBattles';
import type { BattleRoundSession } from '../components/casebattles/BattleRoundOpener';
import {
  BATTLE_ROUND_REVEAL_HOLD_MS,
  getBattleRoundDurationMs,
} from './caseBattleEngine';

export function buildRoundSessionsFromPending(
  pending: BattlePendingRound,
  now = Date.now(),
): BattleRoundSession[] {
  const revealAt = pending.applyAt - BATTLE_ROUND_REVEAL_HOLD_MS;
  const revealed = now >= revealAt;

  return pending.sessions.map(session => ({
    id: `${session.playerId}-round-${pending.roundIndex}`,
    playerId: session.playerId,
    result: session.result,
    grantedSkin: session.grantedSkin,
    revealed,
  }));
}

export function getPendingRoundLandAt(pending: BattlePendingRound): number {
  return pending.applyAt - BATTLE_ROUND_REVEAL_HOLD_MS;
}

export { getBattleRoundDurationMs };
