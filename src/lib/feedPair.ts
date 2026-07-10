import { ALL_SKINS_CATALOG, FEED_USERS, type FeedItem, type Skin } from '../data/skins';
import { applyHouseEdge, fairProbability } from './wheelMath';

export const BASE_TOTAL_UPGRADES = 13_200;

/** Feed is social proof — mostly wins, some losses. */
export const FEED_WIN_RATE = 0.76;

function groupByWeapon(catalog: Skin[]): Map<string, Skin[]> {
  const map = new Map<string, Skin[]>();
  for (const skin of catalog) {
    const list = map.get(skin.weapon) ?? [];
    list.push(skin);
    map.set(skin.weapon, list);
  }
  return map;
}

/** Pick input/target pairs across all weapon types, including cheap (~10+) upgrades. */
export function pickFeedPair(catalog: Skin[] = ALL_SKINS_CATALOG) {
  const byWeapon = groupByWeapon(catalog);
  const weapons = [...byWeapon.keys()];

  for (let attempt = 0; attempt < 50; attempt++) {
    const inputWeapon = weapons[Math.floor(Math.random() * weapons.length)];
    const inputPool = byWeapon.get(inputWeapon) ?? [];

    const preferBudget = Math.random() < 0.62;
    const budgetInputs = inputPool.filter(s => s.price >= 10 && s.price <= 12_000);
    const inputCandidates = preferBudget && budgetInputs.length ? budgetInputs : inputPool;
    if (!inputCandidates.length) continue;

    const input = inputCandidates[Math.floor(Math.random() * inputCandidates.length)];

    const targetWeapon = Math.random() < 0.75
      ? weapons[Math.floor(Math.random() * weapons.length)]
      : inputWeapon;
    const targetPool = (byWeapon.get(targetWeapon) ?? []).filter(s => s.price > input.price);
    if (!targetPool.length) continue;

    const maxTargetPrice = input.price <= 500
      ? input.price * (4 + Math.random() * 35)
      : input.price * (1.15 + Math.random() * 2.5);
    const realisticTargets = targetPool.filter(s => s.price <= maxTargetPrice);
    const targetCandidates = realisticTargets.length ? realisticTargets : targetPool;
    const target = targetCandidates[Math.floor(Math.random() * targetCandidates.length)];

    return { input, target };
  }

  const sorted = [...catalog].sort((a, b) => a.price - b.price);
  const cheap = sorted.find(s => s.price >= 10) ?? sorted[0];
  const expensive = [...sorted].reverse().find(s => s.price > cheap.price) ?? sorted[sorted.length - 1];
  return { input: cheap, target: expensive };
}

export function createFeedItem(): FeedItem {
  const { input, target } = pickFeedPair();
  const won = Math.random() < FEED_WIN_RATE;

  let probability: number;
  if (won) {
    probability = Math.round((32 + Math.random() * 38) * 10) / 10;
  } else {
    const fair = fairProbability(input.price, target.price);
    const withVariance = fair > 0 ? fair + Math.random() * 12 : Math.random() * 22 + 4;
    probability = Math.min(applyHouseEdge(withVariance), 32);
  }

  return {
    id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    username: FEED_USERS[Math.floor(Math.random() * FEED_USERS.length)],
    inputSkin: input.name,
    targetSkin: target.name,
    inputImage: input.image,
    targetImage: target.image,
    probability,
    won,
    timestamp: Date.now(),
  };
}

export function initialFeed(n = 24): FeedItem[] {
  return Array.from({ length: n }, createFeedItem);
}
