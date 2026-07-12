import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { createCaseBattleStore } from './server/lib/caseBattleStore.mjs';

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

export function caseBattlesPlugin(caseBattlesDir: string): Plugin {
  if (!fs.existsSync(caseBattlesDir)) fs.mkdirSync(caseBattlesDir, { recursive: true });
  const caseBattleStore = createCaseBattleStore(caseBattlesDir);

  return {
    name: 'case-battles-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';

        try {
          if (url === '/api/case-battles' && req.method === 'GET') {
            sendJson(res, 200, { battles: caseBattleStore.listLive() });
            return;
          }

          const detailMatch = url.match(/^\/api\/case-battles\/([^/]+)$/);
          if (detailMatch && req.method === 'GET') {
            const battle = caseBattleStore.getById(detailMatch[1]);
            if (!battle) {
              sendJson(res, 404, { error: 'not_found' });
              return;
            }
            sendJson(res, 200, { battle });
            return;
          }

          if (detailMatch && req.method === 'PUT') {
            const body = await readJsonBody(req) as { battle?: { id?: string } };
            const battle = body.battle;
            if (!battle?.id || String(battle.id).toLowerCase() !== detailMatch[1].toLowerCase()) {
              sendJson(res, 400, { error: 'invalid_battle' });
              return;
            }
            const result = caseBattleStore.upsert(battle);
            if (result.error) {
              sendJson(res, 400, { error: result.error });
              return;
            }
            sendJson(res, 200, result);
            return;
          }

          if (detailMatch && req.method === 'DELETE') {
            const result = caseBattleStore.remove(detailMatch[1]);
            if (result.error) {
              sendJson(res, 404, { error: result.error });
              return;
            }
            sendJson(res, 200, result);
            return;
          }
        } catch (error) {
          console.error('[case-battles-api]', error);
          sendJson(res, 500, { error: 'error' });
          return;
        }

        next();
      });
    },
  };
}
