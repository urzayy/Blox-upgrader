import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { createGiveawayStore } from './server/lib/giveawayStore.mjs';
import { createUserStore } from './server/lib/userStore.mjs';

function readJsonBody(req: { on: (event: string, cb: (chunk: Buffer) => void) => void }): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sendJson(
  res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (s: string) => void },
  status: number,
  data: unknown,
) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function giveawaysPlugin(giveawaysDir: string, userDbDir: string, grantsDir: string): Plugin {
  if (!fs.existsSync(giveawaysDir)) fs.mkdirSync(giveawaysDir, { recursive: true });
  const giveawayStore = createGiveawayStore(giveawaysDir, grantsDir);
  const userStore = createUserStore({ userDbDir });

  return {
    name: 'giveaways-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';

        try {
          if (url === '/api/giveaways' && req.method === 'GET') {
            sendJson(res, 200, giveawayStore.getAll());
            return;
          }

          const detailMatch = url.match(/^\/api\/giveaways\/(daily|weekly|monthly)$/);
          if (detailMatch && req.method === 'GET') {
            const period = detailMatch[1];
            const query = new URL(req.url ?? '', 'http://localhost').searchParams;
            const userId = query.get('userId');
            const detail = giveawayStore.getDetail(period, userId);
            if (detail.error) {
              sendJson(res, 400, { error: detail.error });
              return;
            }
            sendJson(res, 200, detail);
            return;
          }

          if (url === '/api/giveaways/join' && req.method === 'POST') {
            const body = await readJsonBody(req) as {
              period?: string;
              userId?: string;
              email?: string;
              nickname?: string;
              avatarId?: number;
            };
            const result = giveawayStore.joinGiveaway(body.period, body);
            if (result.error) {
              sendJson(res, 400, { error: result.error });
              return;
            }
            sendJson(res, 200, result);
            return;
          }

          if (url === '/api/giveaways/deposit-record' && req.method === 'POST') {
            const body = await readJsonBody(req) as {
              userId?: string;
              amount?: number;
              email?: string;
              nickname?: string;
              avatarId?: number;
            };
            const userId = String(body.userId ?? '').trim();
            const amount = Number(body.amount);
            if (!userId || !Number.isFinite(amount) || amount <= 0) {
              sendJson(res, 400, { error: 'invalid_payload' });
              return;
            }
            const updates = giveawayStore.recordUserDeposit(userId, amount, {
              email: body.email,
              nickname: body.nickname,
              avatarId: body.avatarId,
            });
            sendJson(res, 200, { ok: true, updates });
            return;
          }

          if (url === '/api/giveaways/winners' && req.method === 'GET') {
            const query = new URL(req.url ?? '', 'http://localhost').searchParams;
            const limit = Number(query.get('limit') ?? 24);
            sendJson(res, 200, giveawayStore.listWinners(Number.isFinite(limit) ? limit : 24));
            return;
          }

          if (url === '/api/giveaways/pending-win' && req.method === 'GET') {
            const query = new URL(req.url ?? '', 'http://localhost').searchParams;
            const userId = query.get('userId') ?? '';
            if (!userId) {
              sendJson(res, 400, { error: 'userId required' });
              return;
            }
            sendJson(res, 200, giveawayStore.listPendingWins(userId));
            return;
          }

          if (url === '/api/giveaways/pending-win/ack' && req.method === 'POST') {
            const body = await readJsonBody(req) as { userId?: string; pendingId?: string };
            const userId = String(body.userId ?? '').trim();
            const pendingId = String(body.pendingId ?? '').trim();
            if (!userId || !pendingId) {
              sendJson(res, 400, { error: 'invalid_ack' });
              return;
            }
            const result = giveawayStore.ackPendingWin(userId, pendingId);
            if (result.error) {
              sendJson(res, 400, { error: result.error });
              return;
            }
            sendJson(res, 200, result);
            return;
          }

          if (url === '/api/admin/giveaways/open' && req.method === 'POST') {
            const body = await readJsonBody(req) as {
              adminEmail?: string;
              period?: string;
              skin?: unknown;
              depositRequirement?: number;
            };
            if (!userStore.isAdminEmail(String(body.adminEmail ?? '').trim())) {
              sendJson(res, 403, { error: 'forbidden' });
              return;
            }
            const result = giveawayStore.openGiveaway({
              period: body.period,
              skin: body.skin,
              depositRequirement: body.depositRequirement,
              openedBy: body.adminEmail,
            });
            if (result.error) {
              sendJson(res, 400, { error: result.error });
              return;
            }
            sendJson(res, 200, result);
            return;
          }

          if (url === '/api/admin/giveaways/close' && req.method === 'POST') {
            const body = await readJsonBody(req) as {
              adminEmail?: string;
              period?: string;
              pickWinner?: boolean;
            };
            if (!userStore.isAdminEmail(String(body.adminEmail ?? '').trim())) {
              sendJson(res, 403, { error: 'forbidden' });
              return;
            }
            const result = giveawayStore.closeGiveaway({
              period: body.period,
              pickWinner: Boolean(body.pickWinner),
              grantedBy: body.adminEmail,
            });
            if (result.error) {
              sendJson(res, 400, { error: result.error });
              return;
            }
            sendJson(res, 200, result);
            return;
          }
        } catch (error) {
          console.error('[giveaways-api]', error);
          sendJson(res, 500, { error: 'error' });
          return;
        }

        next();
      });
    },
  };
}
