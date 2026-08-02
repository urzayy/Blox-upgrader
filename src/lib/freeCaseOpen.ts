import { canOpenFreeCase, recordFreeCaseOpen } from './freeCaseCooldown';
import { getFreeCaseLoot, pickWeightedFromLoot, toEqualChanceLoot } from './freeCaseLoot';
import { canPlayerOpenFreeCase } from './freeCaseUnlock';
import type { Skin } from '../data/skins';
import { attachFairProofToSkin, pickFairCaseReward } from './fairCaseRoll';

export interface FreeCaseOpenResult {
  granted: Skin;
  openedAt: number;
}

/** Picks and grants a daily free case reward when level and cooldown allow. */
export async function tryOpenFreeCase(
  userId: string,
  slug: string,
  now = Date.now(),
): Promise<FreeCaseOpenResult | null> {
  if (!canPlayerOpenFreeCase(userId, slug)) return null;
  if (!canOpenFreeCase(userId, slug, now)) return null;

  const fairPick = await pickFairCaseReward(userId, slug, { gameType: 'free-case' });
  if (!fairPick) return null;

  const openedAt = now;
  const granted = attachFairProofToSkin(
    createGrantedFreeCaseSkin(fairPick.skin, openedAt),
    fairPick.proof,
    userId,
  );
  recordFreeCaseOpen(userId, slug, openedAt);
  return { granted, openedAt };
}

export function pickFreeCaseReward(slug: string, options?: { joker?: boolean }): Skin | null {
  const { loot } = getFreeCaseLoot(slug);
  const pool = options?.joker ? toEqualChanceLoot(loot) : loot;
  return pickWeightedFromLoot(pool);
}

export function createGrantedFreeCaseSkin(base: Skin, openedAt = Date.now()): Skin {
  return {
    ...base,
    id: `${base.id}_freecase_${openedAt}_${Math.random().toString(36).slice(2, 8)}`,
    obtainedAt: openedAt,
  };
}
