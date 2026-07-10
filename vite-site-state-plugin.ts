import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { BASE_TOTAL_UPGRADES, createFeedItem } from './src/lib/feed';
import { DEV_FEED_BOT_TICK_MS, DEV_FEED_WIN_RATE } from './src/lib/devLiveFeed';
import { driftPlayersOnline } from './src/lib/siteStorage';
import type { FeedItem } from './src/data/skins';

export interface SiteState {
  feed: FeedItem[];
  totalUpgrades: number;
  playersOnline: number;
  updatedAt: number;
}

function readBody(req: { on: (event: string, cb: (chunk: Buffer) => void) => void }): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(
  res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (s?: string) => void },
  status: number,
  data: unknown,
) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function isFeedItem(value: unknown): value is FeedItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as FeedItem;
  return (
    typeof item.id === 'string'
    && typeof item.username === 'string'
    && typeof item.inputSkin === 'string'
    && typeof item.targetSkin === 'string'
    && (item.inputImage === undefined || typeof item.inputImage === 'string')
    && (item.targetImage === undefined || typeof item.targetImage === 'string')
    && typeof item.probability === 'number'
    && typeof item.won === 'boolean'
    && typeof item.timestamp === 'number'
  );
}

function createInitialState(): SiteState {
  return {
    feed: Array.from({ length: 24 }, () => createFeedItem({ winRate: DEV_FEED_WIN_RATE })),
    totalUpgrades: BASE_TOTAL_UPGRADES,
    playersOnline: 500 + Math.floor(Math.random() * 300) + 1,
    updatedAt: Date.now(),
  };
}

export function siteStatePlugin(stateDir: string): Plugin {
  return {
    name: 'site-state-api',
    configureServer(server) {
      if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });

      const stateFile = path.join(stateDir, 'state.json');

      const loadState = (): SiteState => {
        if (!fs.existsSync(stateFile)) {
          const initial = createInitialState();
          fs.writeFileSync(stateFile, JSON.stringify(initial, null, 2), 'utf8');
          return initial;
        }
        try {
          const parsed = JSON.parse(fs.readFileSync(stateFile, 'utf8')) as SiteState;
          if (!Array.isArray(parsed.feed) || !parsed.feed.every(isFeedItem)) {
            const initial = createInitialState();
            fs.writeFileSync(stateFile, JSON.stringify(initial, null, 2), 'utf8');
            return initial;
          }
          return {
            feed: parsed.feed.slice(0, 40),
            totalUpgrades: Math.max(BASE_TOTAL_UPGRADES, Math.floor(parsed.totalUpgrades ?? BASE_TOTAL_UPGRADES)),
            playersOnline: Math.floor(parsed.playersOnline ?? 650),
            updatedAt: parsed.updatedAt ?? Date.now(),
          };
        } catch {
          const initial = createInitialState();
          fs.writeFileSync(stateFile, JSON.stringify(initial, null, 2), 'utf8');
          return initial;
        }
      };

      const saveState = (state: SiteState) => {
        const next: SiteState = {
          feed: state.feed.slice(0, 40),
          totalUpgrades: Math.max(BASE_TOTAL_UPGRADES, Math.floor(state.totalUpgrades)),
          playersOnline: Math.floor(state.playersOnline),
          updatedAt: Date.now(),
        };
        fs.writeFileSync(stateFile, JSON.stringify(next, null, 2), 'utf8');
        return next;
      };

      const appendFeedItem = (state: SiteState, item: FeedItem): SiteState => ({
        ...state,
        feed: [item, ...state.feed.filter(existing => existing.id !== item.id)].slice(0, 40),
        totalUpgrades: state.totalUpgrades + 1,
        updatedAt: Date.now(),
      });

      const botTick = () => {
        const state = loadState();
        const botItem = createFeedItem({ winRate: DEV_FEED_WIN_RATE });
        saveState({
          ...appendFeedItem(state, botItem),
          playersOnline: driftPlayersOnline(state.playersOnline),
        });
      };

      botTick();
      const botInterval = setInterval(botTick, DEV_FEED_BOT_TICK_MS);

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/site-state')) return next();

        try {
          if (req.method === 'GET' && (url === '/api/site-state' || url.startsWith('/api/site-state?'))) {
            sendJson(res, 200, loadState());
            return;
          }

          if (req.method === 'POST' && url === '/api/site-state/feed-event') {
            const body = JSON.parse(await readBody(req)) as FeedItem;
            if (!isFeedItem(body)) {
              sendJson(res, 400, { error: 'invalid feed item' });
              return;
            }
            const state = loadState();
            sendJson(res, 200, saveState(appendFeedItem(state, body)));
            return;
          }

          sendJson(res, 404, { error: 'not found' });
        } catch {
          sendJson(res, 500, { error: 'server error' });
        }
      });

      server.httpServer?.once('close', () => {
        clearInterval(botInterval);
      });
    },
  };
}
