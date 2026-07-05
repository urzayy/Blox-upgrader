import type { FeedItem } from '../data/skins';
import { BASE_TOTAL_UPGRADES, initialFeed } from './feed';

const FEED_KEY = 'blox-upgrader/feed';
const UPGRADES_KEY = 'blox-upgrader/total-upgrades';
const PLAYERS_KEY = 'blox-upgrader/players-online';

const BASE_PLAYERS = 500;
const MIN_PLAYERS = 480;
const MAX_PLAYERS = 820;

function isFeedItem(value: unknown): value is FeedItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as FeedItem;
  return (
    typeof item.id === 'string'
    && typeof item.username === 'string'
    && typeof item.inputSkin === 'string'
    && typeof item.targetSkin === 'string'
    && typeof item.probability === 'number'
    && typeof item.won === 'boolean'
    && typeof item.timestamp === 'number'
  );
}

export function loadFeed(): FeedItem[] {
  try {
    const raw = localStorage.getItem(FEED_KEY);
    if (!raw) {
      const seed = initialFeed();
      saveFeed(seed);
      return seed;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isFeedItem)) {
      const seed = initialFeed();
      saveFeed(seed);
      return seed;
    }
    return parsed.slice(0, 40);
  } catch {
    return initialFeed();
  }
}

export function saveFeed(items: FeedItem[]): void {
  try {
    localStorage.setItem(FEED_KEY, JSON.stringify(items.slice(0, 40)));
  } catch { /* noop */ }
}

export function loadTotalUpgrades(): number {
  try {
    const raw = localStorage.getItem(UPGRADES_KEY);
    if (!raw) {
      saveTotalUpgrades(BASE_TOTAL_UPGRADES);
      return BASE_TOTAL_UPGRADES;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < BASE_TOTAL_UPGRADES) return BASE_TOTAL_UPGRADES;
    return Math.floor(n);
  } catch {
    return BASE_TOTAL_UPGRADES;
  }
}

export function saveTotalUpgrades(total: number): void {
  try {
    localStorage.setItem(UPGRADES_KEY, String(Math.floor(total)));
  } catch { /* noop */ }
}

function initialPlayerCount() {
  return BASE_PLAYERS + Math.floor(Math.random() * 300) + 1;
}

export function loadPlayersOnline(): number {
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    if (!raw) {
      const seed = initialPlayerCount();
      savePlayersOnline(seed);
      return seed;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) return initialPlayerCount();
    return Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, Math.floor(n)));
  } catch {
    return initialPlayerCount();
  }
}

export function savePlayersOnline(count: number): void {
  try {
    localStorage.setItem(PLAYERS_KEY, String(Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, Math.floor(count)))));
  } catch { /* noop */ }
}

/** Small drift so online count feels live without random jumps on reload. */
export function driftPlayersOnline(current: number): number {
  const delta = Math.floor(Math.random() * 17) - 8;
  return Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, current + delta));
}
