import type { BattleFormat } from './caseBattles';
import { getBattleFormatMeta } from './caseBattleCreate';
import type { BattleSide } from './battleSides';

/** Slot index groups separated by VS — e.g. 1v1v1 → [[0],[1],[2]], 2v2 → [[0,1],[2,3]]. */
export function getBattleArenaSegments(format: BattleFormat): number[][] {
  const meta = getBattleFormatMeta(format);

  if (meta.teamSizes?.length) {
    const segments: number[][] = [];
    let slot = 0;
    for (const size of meta.teamSizes) {
      segments.push(Array.from({ length: size }, (_, index) => slot + index));
      slot += size;
    }
    return segments;
  }

  return Array.from({ length: meta.maxPlayers }, (_, index) => [index]);
}

export function isTwoSideTeamFormat(format: BattleFormat): boolean {
  return format === '2v2' || format === '3v3';
}

export function segmentIsWinningSide(
  format: BattleFormat,
  segmentIndex: number,
  winningSide: BattleSide | null,
): boolean {
  if (!winningSide || !isTwoSideTeamFormat(format)) return false;
  return segmentIndex === 0
    ? winningSide === 'counter-terrorist'
    : winningSide === 'terrorist';
}

export function segmentGridClass(slotCount: number): string {
  if (slotCount <= 1) return 'grid-cols-1';
  if (slotCount === 2) return 'grid-cols-2';
  return 'grid-cols-3';
}

export function arenaGapClass(maxPlayers: number): string {
  if (maxPlayers >= 6) return 'gap-1.5 p-1';
  if (maxPlayers >= 4) return 'gap-2 p-1.5 sm:gap-2.5 sm:p-2';
  return 'gap-2 p-1.5 sm:gap-3 sm:p-2';
}
