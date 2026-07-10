import { getFreeCaseLoot, pickWeightedFromLoot, toEqualChanceLoot } from './freeCaseLoot';
import type { Skin } from '../data/skins';

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
