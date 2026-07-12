import { getFreeCaseBySlug } from './freeCaseTiers';
import { getPlayerLevel } from './xpStorage';

/** Minimum player level before any daily free case can be opened. */
export const MIN_FREE_CASE_LEVEL = 2;

export function playerLevelForFreeCases(userId: string | null | undefined): number {
  return getPlayerLevel(userId).level;
}

export function canPlayerOpenFreeCase(
  userId: string | null | undefined,
  slug: string,
): boolean {
  if (!userId) return false;

  const tier = getFreeCaseBySlug(slug);
  if (!tier) return false;

  const playerLevel = getPlayerLevel(userId).level;
  if (playerLevel < MIN_FREE_CASE_LEVEL) return false;
  return playerLevel >= tier.level;
}

export function isFreeCaseUnlockedForPlayer(
  tierLevel: number,
  playerLevel: number,
  _slug: string,
): boolean {
  if (playerLevel < MIN_FREE_CASE_LEVEL) return false;
  return playerLevel >= tierLevel;
}
