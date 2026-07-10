import { FREE_CASE_TIERS, rankLabelForTier } from './freeCaseTiers';

export type PlayerRank = 'bronze';

export interface PlayerLevelProgress {
  level: number;
  xp: number;
}

export interface PlayerLevelState {
  rank: PlayerRank;
  rankLabel: string;
  level: number;
  /** XP earned in the current level (resets to 0 on level-up). */
  xp: number;
  /** XP required to advance from the current level. */
  xpToNext: number;
  totalXp: number;
}

export const MAX_LEVEL = 90;
export const XP_PER_WAGERED_COIN = 7;

/**
 * XP required while at level L to reach level L+1.
 * Index 0 = level 1 → 2, index 88 = level 89 → 90.
 */
export const LEVEL_XP_TO_ADVANCE: readonly number[] = [
  200, 500, 800, 1100, 1500, 2000, 2800, 3700, 4800, 6100,
  7600, 9300, 11300, 13600, 16200, 19100, 22400, 26100, 30200, 34800,
  39900, 45500, 51700, 58500, 66000, 74200, 83200, 93000, 103700, 115400,
  128200, 142200, 157500, 174200, 192400, 212200, 233800, 257300, 282900, 310800,
  341200, 374300, 410300, 449500, 492200, 538700, 589400, 644700, 705000, 770800,
  842600, 921000, 1006700, 1100500, 1203100, 1315500, 1438700, 1573900, 1722300, 1885300,
  2064300, 2260900, 2476900, 2714300, 2975400, 3262700, 3578700, 3926600, 4309300, 4730200,
  5193200, 5702500, 6262700, 6878900, 7556800, 8302400, 9122600, 10024900, 11017400, 12109100,
  13310000, 14631000, 16084000, 17682000, 19440000, 21374000, 23501000, 25842000, 28417000, 31250000,
];

export function xpRequiredForLevel(level: number): number {
  if (level < 1 || level >= MAX_LEVEL) return 0;
  return LEVEL_XP_TO_ADVANCE[level - 1] ?? 0;
}

export function wageredCoinsToXp(wageredCoins: number): number {
  if (!Number.isFinite(wageredCoins) || wageredCoins <= 0) return 0;
  return Math.floor(wageredCoins * XP_PER_WAGERED_COIN);
}

export function applyWagerXp(progress: PlayerLevelProgress, gainedXp: number): PlayerLevelProgress {
  if (gainedXp <= 0) return progress;

  let { level, xp } = progress;
  xp += gainedXp;

  while (level < MAX_LEVEL) {
    const required = xpRequiredForLevel(level);
    if (required <= 0 || xp < required) break;
    level += 1;
    xp = 0;
  }

  return { level, xp };
}

export function rankLabelForLevel(level: number): string {
  if (level < 2) return 'UNRANKED';

  let label = 'UNRANKED';
  for (const tier of FREE_CASE_TIERS) {
    if (level >= tier.level) {
      label = rankLabelForTier(tier);
    }
  }
  return label;
}

export function buildPlayerLevelState(progress: PlayerLevelProgress): PlayerLevelState {
  const level = Math.min(Math.max(1, Math.floor(progress.level)), MAX_LEVEL);
  const xp = Math.max(0, Math.floor(progress.xp));
  const xpToNext = xpRequiredForLevel(level);

  const completedBefore = LEVEL_XP_TO_ADVANCE.slice(0, level - 1).reduce((sum, value) => sum + value, 0);

  return {
    rank: 'bronze',
    rankLabel: rankLabelForLevel(level),
    level,
    xp,
    xpToNext,
    totalXp: completedBefore + xp,
  };
}

/** @deprecated Use getPlayerLevel(userId) or usePlayerLevel() */
export function getDefaultPlayerLevel(): PlayerLevelState {
  return buildPlayerLevelState({ level: 1, xp: 0 });
}
