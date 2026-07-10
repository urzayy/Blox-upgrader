import type { Plugin } from 'vite';
import {
  getActivePresenceCount,
  registerPresenceHeartbeat,
} from './server/lib/presenceStore.mjs';

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

const ADMIN_EMAILS = new Set([
  'urzay1v1@gmail.com',
  'ecruzcastillo2009@gmail.com',
]);

export function presencePlugin(): Plugin {
  return {
    name: 'presence-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/api/presence') && !url.startsWith('/api/admin/presence')) {
          return next();
        }

        try {
          if (req.method === 'POST' && url === '/api/presence/heartbeat') {
            const raw = await readBody(req);
            const body = raw ? JSON.parse(raw) as { userId?: string; visitorId?: string } : {};
            const result = registerPresenceHeartbeat(body);
            sendJson(res, result.ok ? 200 : 400, result);
            return;
          }

          if (req.method === 'GET' && url === '/api/admin/presence') {
            const adminEmail = new URL(req.url ?? '', 'http://local').searchParams
              .get('adminEmail')
              ?.trim()
              .toLowerCase() ?? '';
            if (!ADMIN_EMAILS.has(adminEmail)) {
              sendJson(res, 403, { error: 'forbidden' });
              return;
            }
            sendJson(res, 200, {
              count: getActivePresenceCount(),
              updatedAt: Date.now(),
            });
            return;
          }

          sendJson(res, 404, { error: 'not found' });
        } catch {
          sendJson(res, 500, { error: 'server error' });
        }
      });
    },
  };
}
