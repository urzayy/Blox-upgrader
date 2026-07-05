import { FEED_USERS, TARGET_POOL, type FeedItem } from '../data/skins';
import { applyHouseEdge, fairProbability } from './wheelMath';

export const BASE_TOTAL_UPGRADES = 13_200;

/** Feed is social proof — mostly wins, some losses. */
const FEED_WIN_RATE = 0.76;

function pickFeedPair() {
  const pool = TARGET_POOL;
  for (let i = 0; i < 30; i++) {
    const input = pool[Math.floor(Math.random() * pool.length)];
    const target = pool[Math.floor(Math.random() * pool.length)];
    if (input.price < target.price) return { input, target };
  }
  const input = pool[pool.length - 1];
  const target = pool[0];
  return { input, target };
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
