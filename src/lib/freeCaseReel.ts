import type { Skin } from '../data/skins';
import { applyPreviewPrefixToReel } from './casePreviewStrip';
import { getFreeCaseLoot, toEqualChanceLoot, type FreeCaseLootItem } from './freeCaseLoot';
import {
  getRoyalLootPool,
  qualifiesForRoyalSpin,
  ROYAL_TEASE_CHANCE,
} from './freeCaseRoyal';

export interface FreeCaseReelItem {
  skin: Skin;
  isJackpot: boolean;
  /** BloxRoyal placeholder — hides the real royal skin while the reel passes. */
  isRoyal?: boolean;
  /** Skin belongs to the royal tier (<=1% chance). */
  isRoyalLoot?: boolean;
}

export interface FreeCaseReelResult {
  rewardSkin: Skin;
  reel: FreeCaseReelItem[];
  winIndex: number;
  isRoyalSpin?: boolean;
  royalReel?: FreeCaseReelResult;
}

const REEL_LENGTH = 48;
const WIN_INDEX = 38;
const TEASE_CHANCE = 0.32;

function pickWeightedDecoy(loot: FreeCaseLootItem[]): Skin {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const item of loot) {
    cumulative += item.chance;
    if (roll < cumulative) return item.skin;
  }
  return loot[loot.length - 1]?.skin ?? loot[0].skin;
}

function pickFromPool(pool: FreeCaseLootItem[], fallback: Skin): Skin {
  if (!pool.length) return fallback;
  return pool[Math.floor(Math.random() * pool.length)].skin;
}

function pickTeaseSkin(loot: FreeCaseLootItem[]): Skin | null {
  const sorted = [...loot].sort((a, b) => b.skin.price - a.skin.price);
  const top = sorted.slice(0, Math.min(2, sorted.length));
  if (!top.length) return null;
  return top[Math.floor(Math.random() * top.length)].skin;
}

function pickTeaseIndices(decoyCount: number, teaseCount: number): Set<number> {
  const indices = new Set<number>();
  while (indices.size < teaseCount && indices.size < decoyCount) {
    indices.add(Math.floor(Math.random() * decoyCount));
  }
  return indices;
}

function pickRoyalTeaseIndices(decoyCount: number, maxCards: number): Set<number> {
  const indices = new Set<number>();
  if (decoyCount <= 0 || maxCards <= 0) return indices;

  while (indices.size < maxCards) {
    indices.add(Math.floor(Math.random() * decoyCount));
  }
  return indices;
}

function pushReelItem(
  reel: FreeCaseReelItem[],
  skin: Skin,
  slug: string,
  options: { royalWin?: boolean; royalOnlyDecoys?: boolean } | undefined,
  isJackpot: boolean,
  forceRoyal = false,
) {
  const isRoyalLoot = qualifiesForRoyalSpin(slug, skin.id);
  const maskAsRoyal =
    forceRoyal
    || (options?.royalWin && isRoyalLoot)
    || (!options?.royalOnlyDecoys && !options?.royalWin && isRoyalLoot);

  reel.push({
    skin,
    isJackpot: maskAsRoyal ? false : isJackpot,
    isRoyal: maskAsRoyal,
    isRoyalLoot,
  });
}

function buildReelBand(
  slug: string,
  rewardSkin: Skin,
  pool: FreeCaseLootItem[],
  options?: { royalWin?: boolean; royalOnlyDecoys?: boolean; joker?: boolean },
): FreeCaseReelItem[] {
  const teaseSkin = pickTeaseSkin(pool);
  const caseHasTease = teaseSkin && Math.random() < TEASE_CHANCE;
  const teaseCount = caseHasTease ? 1 + Math.floor(Math.random() * 2) : 0;
  const decoyCount = REEL_LENGTH - 1;
  const teaseIndices = pickTeaseIndices(decoyCount, teaseCount);
  const rarePool = getRoyalLootPool(slug);
  const royalPool = options?.royalOnlyDecoys ? rarePool : pool;
  const canRoyalTease =
    !options?.joker
    && !options?.royalWin
    && !options?.royalOnlyDecoys
    && rarePool.length > 0
    && Math.random() < ROYAL_TEASE_CHANCE;
  const royalTeaseIndices = canRoyalTease
    ? pickRoyalTeaseIndices(decoyCount, 1)
    : new Set<number>();
  const royalTeaseSkin = rarePool[0]?.skin ?? rewardSkin;

  const reel: FreeCaseReelItem[] = [];
  let decoyIndex = 0;

  for (let i = 0; i < REEL_LENGTH; i++) {
    if (i === WIN_INDEX) {
      pushReelItem(
        reel,
        rewardSkin,
        slug,
        options?.royalWin ? { royalWin: true } : options,
        false,
        Boolean(options?.royalWin),
      );
      continue;
    }

    if (royalTeaseIndices.has(decoyIndex)) {
      pushReelItem(reel, royalTeaseSkin, slug, options, false, true);
      decoyIndex++;
      continue;
    }

    const useTease = teaseIndices.has(decoyIndex) && teaseSkin && !options?.royalOnlyDecoys;
    const skin = useTease
      ? teaseSkin
      : options?.royalOnlyDecoys
        ? pickFromPool(royalPool, rewardSkin)
        : options?.joker
          ? pickFromPool(pool, rewardSkin)
          : pickWeightedDecoy(pool);
    pushReelItem(
      reel,
      skin,
      slug,
      options,
      Boolean(useTease && skin.price > rewardSkin.price),
    );
    decoyIndex++;
  }

  return reel;
}

export function buildRoyalSpinReel(slug: string, rewardSkin: Skin): FreeCaseReelResult {
  const pool = getRoyalLootPool(slug);
  const reel = buildReelBand(slug, rewardSkin, pool, { royalOnlyDecoys: true });

  return {
    rewardSkin,
    reel,
    winIndex: WIN_INDEX,
  };
}

export function buildFreeCaseReel(
  slug: string,
  rewardSkin: Skin,
  previewSkins?: Skin[],
  options?: { joker?: boolean },
): FreeCaseReelResult {
  const { loot } = getFreeCaseLoot(slug);
  const basePool = loot.length ? loot : [{ skin: rewardSkin, chance: 100 }];
  const pool = options?.joker ? toEqualChanceLoot(basePool) : basePool;
  const isRoyalSpin = qualifiesForRoyalSpin(slug, rewardSkin.id);
  const reel = buildReelBand(slug, rewardSkin, pool, { royalWin: isRoyalSpin, joker: options?.joker });

  if (previewSkins?.length) {
    applyPreviewPrefixToReel(reel, slug, previewSkins, WIN_INDEX);
  }

  return {
    rewardSkin,
    reel,
    winIndex: WIN_INDEX,
    isRoyalSpin,
    royalReel: isRoyalSpin ? buildRoyalSpinReel(slug, rewardSkin) : undefined,
  };
}
