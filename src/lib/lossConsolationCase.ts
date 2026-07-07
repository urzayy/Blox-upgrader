import { ALL_SKINS_CATALOG, type Skin } from '../data/skins';

/** Weighted % of lost stake returned as consolation (sums to 100). Max 12%. */
const PERCENT_WEIGHTS: readonly { percent: number; weight: number }[] = [
  { percent: 3, weight: 21 },
  { percent: 4, weight: 20 },
  { percent: 5, weight: 16 },
  { percent: 6, weight: 14 },
  { percent: 7, weight: 10 },
  { percent: 8, weight: 6 },
  { percent: 9, weight: 4 },
  { percent: 10, weight: 3 },
  { percent: 11, weight: 2.5 },
  { percent: 12, weight: 3.5 },
];

/** Visual reel band: 75%–200% of lost value (e.g. lost 100 → 75–200). */
const REEL_MIN_RATIO = 0.75;
const REEL_MAX_RATIO = 2;
/** Rare visual tease up to 400% of lost (e.g. lost 100 → up to 400). */
const REEL_TEASE_MAX_RATIO = 4;
/** ~30% of cases include 1–2 high-value tease items in the roll. */
const CASE_TEASE_CHANCE = 0.3;

export interface CaseReelItem {
  skin: Skin;
  displayPrice: number;
  isJackpot: boolean;
}

export interface LossConsolationResult {
  percent: number;
  rewardCoins: number;
  rewardSkin: Skin;
  reel: CaseReelItem[];
  winIndex: number;
}

const REEL_LENGTH = 48;
const WIN_INDEX = 38;
const PREMIUM_WEAPONS = new Set(['Knife', 'Gloves']);

export function rollConsolationPercent(): number {
  let roll = Math.random() * 100;
  for (const entry of PERCENT_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) return entry.percent;
  }
  return PERCENT_WEIGHTS[PERCENT_WEIGHTS.length - 1].percent;
}

export function findSkinNearPrice(catalog: Skin[], targetPrice: number): Skin {
  if (catalog.length === 0) {
    throw new Error('findSkinNearPrice: empty catalog');
  }
  if (targetPrice <= 0) {
    return catalog.reduce((min, s) => (s.price < min.price ? s : min), catalog[0]);
  }
  return catalog.reduce((best, skin) => (
    Math.abs(skin.price - targetPrice) < Math.abs(best.price - targetPrice) ? skin : best
  ));
}

function isNormalWeapon(skin: Skin): boolean {
  return !PREMIUM_WEAPONS.has(skin.weapon);
}

function pickRandom(pool: Skin[]): Skin {
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}

function filterPriceBand(catalog: Skin[], minPrice: number, maxPrice: number, preferNormal = true): Skin[] {
  const inBand = catalog.filter(skin => skin.price >= minPrice && skin.price <= maxPrice);
  if (preferNormal) {
    const normal = inBand.filter(isNormalWeapon);
    if (normal.length) return normal;
  }
  return inBand;
}

function nearestBandPool(catalog: Skin[], targetMin: number, targetMax: number, preferNormal = true): Skin[] {
  const direct = filterPriceBand(catalog, targetMin, targetMax, preferNormal);
  if (direct.length) return direct;

  const anchor = (targetMin + targetMax) / 2;
  const sorted = [...catalog].sort((a, b) => (
    Math.abs(a.price - anchor) - Math.abs(b.price - anchor)
  ));
  const slice = preferNormal
    ? sorted.filter(isNormalWeapon).slice(0, 24)
    : sorted.slice(0, 24);
  return slice.length ? slice : catalog.slice(0, 24);
}

function buildReelPools(catalog: Skin[], lostValue: number) {
  const reelMin = Math.max(1, Math.floor(lostValue * REEL_MIN_RATIO));
  const reelMax = Math.max(reelMin + 1, Math.ceil(lostValue * REEL_MAX_RATIO));
  const teaseMin = reelMax + 1;
  const teaseMax = Math.max(teaseMin, Math.ceil(lostValue * REEL_TEASE_MAX_RATIO));

  const corePool = nearestBandPool(catalog, reelMin, reelMax, true);
  const teasePool = teaseMax > reelMax
    ? nearestBandPool(catalog, teaseMin, teaseMax, false)
    : [];

  return { corePool, teasePool, reelMin, reelMax, teaseMax };
}

function buildDecoyReelItem(corePool: Skin[], teasePool: Skin[], useTease: boolean): CaseReelItem {
  if (useTease && teasePool.length) {
    const skin = pickRandom(teasePool);
    return {
      skin,
      displayPrice: skin.price,
      isJackpot: true,
    };
  }

  const skin = pickRandom(corePool);
  return {
    skin,
    displayPrice: skin.price,
    isJackpot: false,
  };
}

function pickTeaseIndices(decoyCount: number, teaseCount: number): Set<number> {
  const indices = new Set<number>();
  while (indices.size < teaseCount && indices.size < decoyCount) {
    indices.add(Math.floor(Math.random() * decoyCount));
  }
  return indices;
}

export function buildLossConsolationCase(lostValue: number): LossConsolationResult {
  const catalog = ALL_SKINS_CATALOG;
  const normalCatalog = catalog.filter(isNormalWeapon);
  const percent = rollConsolationPercent();
  const rewardCoins = Math.max(1, Math.floor(lostValue * percent / 100));
  const rewardSkin = findSkinNearPrice(normalCatalog, rewardCoins);

  const { corePool, teasePool } = buildReelPools(catalog, lostValue);
  const caseHasTease = teasePool.length > 0 && Math.random() < CASE_TEASE_CHANCE;
  const teaseCount = caseHasTease ? 1 + Math.floor(Math.random() * 2) : 0;
  const decoyCount = REEL_LENGTH - 1;
  const teaseIndices = pickTeaseIndices(decoyCount, teaseCount);

  const reel: CaseReelItem[] = [];
  let decoyIndex = 0;

  for (let i = 0; i < REEL_LENGTH; i++) {
    if (i === WIN_INDEX) {
      reel.push({
        skin: rewardSkin,
        displayPrice: rewardSkin.price,
        isJackpot: false,
      });
      continue;
    }

    reel.push(buildDecoyReelItem(corePool, teasePool, teaseIndices.has(decoyIndex)));
    decoyIndex++;
  }

  return {
    percent,
    rewardCoins,
    rewardSkin,
    reel,
    winIndex: WIN_INDEX,
  };
}
