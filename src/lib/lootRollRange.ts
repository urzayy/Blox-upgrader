import { ROLL_MAX } from './wheelMath';

export interface LootRollRange {
  start: number;
  end: number;
}

export function formatLootRollRange(range: LootRollRange): string {
  return `${range.start}-${range.end}`;
}

/** Maps catalog entry order to high-end roll ranges (rarest listed first → 99900–100000). */
export function buildLootRollRangesFromEntries(
  entries: Array<{ skinId: string; chance: number }>,
): Map<string, LootRollRange> {
  let rollHigh = ROLL_MAX;
  const ranges = new Map<string, LootRollRange>();

  for (const entry of entries) {
    const slots = Math.max(1, Math.ceil((entry.chance / 100) * ROLL_MAX));
    const end = rollHigh;
    const start = Math.max(1, end - slots);
    ranges.set(entry.skinId, { start, end });
    rollHigh = start - 1;
  }

  return ranges;
}

export function pickSkinIdFromRoll(
  roll: number,
  entryOrder: string[],
  ranges: Map<string, LootRollRange>,
): string | null {
  for (const skinId of entryOrder) {
    const range = ranges.get(skinId);
    if (range && roll >= range.start && roll <= range.end) return skinId;
  }
  return entryOrder[entryOrder.length - 1] ?? null;
}

export function formatLootOddsDisplay(chance: number): string {
  if (chance >= 1) return `${chance % 1 === 0 ? chance.toFixed(0) : chance.toFixed(2)}%`;
  if (chance >= 0.01) return `${chance.toFixed(2)}%`;
  if (chance >= 0.001) return `${chance.toFixed(3)}%`;
  return `${chance.toFixed(4)}%`;
}
