import type { FeedItem } from '../data/skins';

export interface SiteState {
  feed: FeedItem[];
  totalUpgrades: number;
  playersOnline: number;
  updatedAt: number;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchSiteState(): Promise<SiteState> {
  return api<SiteState>('/api/site-state');
}

export async function publishFeedEvent(item: FeedItem): Promise<SiteState> {
  return api<SiteState>('/api/site-state/feed-event', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

function feedsEqual(a: FeedItem[], b: FeedItem[]): boolean {
  if (a.length !== b.length) return false;
  if (a.length === 0) return true;
  return a[0].id === b[0].id && a[a.length - 1].id === b[b.length - 1].id;
}

export function applySiteState(
  state: SiteState,
  setters: {
    setFeed: (value: FeedItem[] | ((prev: FeedItem[]) => FeedItem[])) => void;
    setTotalUpgrades: (value: number | ((prev: number) => number)) => void;
    setPlayersOnline: (value: number | ((prev: number) => number)) => void;
  },
) {
  setters.setFeed(prev => (feedsEqual(prev, state.feed) ? prev : state.feed));
  setters.setTotalUpgrades(prev => (prev === state.totalUpgrades ? prev : state.totalUpgrades));
  setters.setPlayersOnline(prev => (prev === state.playersOnline ? prev : state.playersOnline));
}
