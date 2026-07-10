import { getFreeCaseLoot, getLootChanceForSkin, type FreeCaseLootItem } from './freeCaseLoot';

/** Skins at or below this chance trigger the BloxRoyal spin (includes exactly 1%). */
export const ROYAL_SPIN_MAX_CHANCE = 1;
/** Chance per normal roll to flash a BloxRoyal tease card (no real royal win). */
export const ROYAL_TEASE_CHANCE = 0.09;

export function isRoyalLootChance(chance: number): boolean {
  return chance <= ROYAL_SPIN_MAX_CHANCE;
}

export function qualifiesForRoyalSpin(slug: string, skinId: string): boolean {
  const chance = getLootChanceForSkin(slug, skinId);
  return chance != null && isRoyalLootChance(chance);
}

export function getRoyalLootPool(slug: string): FreeCaseLootItem[] {
  const { loot } = getFreeCaseLoot(slug);
  return loot.filter(item => isRoyalLootChance(item.chance));
}

export function caseHasRoyalLoot(slug: string): boolean {
  return getRoyalLootPool(slug).length > 0;
}
