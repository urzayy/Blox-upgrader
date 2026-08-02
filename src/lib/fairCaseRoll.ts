import type { Skin } from '../data/skins';
import { saveFairProof } from './fairProofStorage';
import { getFreeCaseLoot, toEqualChanceLoot, type FreeCaseLootItem } from './freeCaseLoot';
import {
  executeFairRoll,
  pickSkinFromFairRoll,
  type FairGameType,
  type FairRollProof,
} from './provablyFair';

export interface FairCasePickResult {
  skin: Skin;
  proof: FairRollProof;
}

export async function pickFairCaseReward(
  userId: string,
  slug: string,
  options?: { joker?: boolean; gameType?: FairGameType },
): Promise<FairCasePickResult | null> {
  const { loot, entryOrder } = getFreeCaseLoot(slug);
  const pool: FreeCaseLootItem[] = options?.joker ? toEqualChanceLoot(loot) : loot;
  if (!pool.length) return null;

  const proof = await executeFairRoll(userId, options?.gameType ?? 'case', {
    caseSlug: slug,
  });

  const skin = pickSkinFromFairRoll(pool, proof.roll, entryOrder);
  if (!skin) return null;

  proof.gameMeta = {
    ...proof.gameMeta,
    caseSlug: slug,
    skinId: skin.id,
    skinName: skin.name,
  };

  return { skin, proof };
}

export function attachFairProofToSkin(skin: Skin, proof: FairRollProof, userId: string): Skin {
  saveFairProof(userId, skin.id, proof);
  return { ...skin, fairProof: proof };
}
