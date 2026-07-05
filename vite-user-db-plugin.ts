import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import type { Plugin } from 'vite';
import { createUserStore } from './server/lib/userStore.mjs';
import { createPlayerStateStore } from './server/lib/playerStateStore.mjs';

dotenv.config();

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

function sendJson(res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (s: string) => void }, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function userDbPlugin(dbDir: string): Plugin {
  const userStore = createUserStore({ userDbDir: dbDir });
  const playerStateDir = path.resolve(path.dirname(dbDir), 'player-state');
  const playerStateStore = createPlayerStateStore({ playerStateDir });

  function appendTxtLog(email: string, line: string) {
    const logsDir = path.resolve(path.dirname(dbDir), 'user-logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const sanitizeEmail = (value: string) => value.replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(logsDir, `${sanitizeEmail(email)}.txt`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(
        filePath,
        `# Blox Upgrader — ${email}\n# Created: ${new Date().toISOString()}\n\n${line}\n`,
        'utf8',
      );
    } else {
      fs.appendFileSync(filePath, `${line}\n`, 'utf8');
    }
  }

  return {
    name: 'user-db-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';

        try {
          if (url === '/api/auth/register' && req.method === 'POST') {
            const body = await readJsonBody(req) as Record<string, unknown>;
            if (!body.userId || !body.email || !body.passwordHash || !body.salt) {
              sendJson(res, 400, { error: 'bad request' });
              return;
            }
            const result = await userStore.registerAccount({ ...body, isNewAccount: true });
            if (result?.line && typeof body.email === 'string') appendTxtLog(body.email, result.line);
            sendJson(res, 200, { ok: true, user: result?.user ?? null });
            return;
          }

          if (url === '/api/auth/login' && req.method === 'POST') {
            const body = await readJsonBody(req) as { userId?: string; email?: string; nickname?: string };
            if (!body.userId || !body.email) {
              sendJson(res, 400, { error: 'bad request' });
              return;
            }
            const result = await userStore.touchAccountLogin(body);
            if (result?.line) appendTxtLog(body.email, result.line);
            sendJson(res, 200, { ok: true, user: result?.user ?? null });
            return;
          }

          if (url === '/api/users/sync' && req.method === 'POST') {
            const body = await readJsonBody(req) as {
              userId?: string;
              email?: string;
              nickname?: string;
              isNewAccount?: boolean;
            };
            if (!body.userId || !body.email) {
              sendJson(res, 400, { error: 'bad request' });
              return;
            }
            const user = await userStore.upsertUser(body);
            sendJson(res, 200, { ok: true, user });
            return;
          }

          if (url === '/api/user-log' && req.method === 'POST') {
            const body = await readJsonBody(req) as {
              userId?: string;
              email?: string;
              line?: string;
              action?: string;
              details?: Record<string, string | number | boolean | null | undefined>;
            };
            if (!body.email || typeof body.line !== 'string') {
              sendJson(res, 400, { error: 'bad request' });
              return;
            }
            appendTxtLog(body.email, body.line);
            const event = await userStore.appendEvent(body);
            sendJson(res, 200, { ok: true, eventId: event.id });
            return;
          }

          if (url === '/api/player-state/sync' && req.method === 'POST') {
            const body = await readJsonBody(req) as {
              userId?: string;
              email?: string;
              balance?: number;
              inventory?: unknown;
            };
            if (!body.userId || !body.email) {
              sendJson(res, 400, { error: 'bad request' });
              return;
            }
            const state = await playerStateStore.savePlayerState(body);
            sendJson(res, 200, { ok: true, state });
            return;
          }

          if (url === '/api/admin/player-state' && req.method === 'GET') {
            const params = new URL(req.url ?? '', 'http://local').searchParams;
            const adminEmail = params.get('adminEmail') ?? '';
            const email = params.get('email') ?? '';
            if (!playerStateStore.isAdminEmail(adminEmail)) {
              sendJson(res, 403, { error: 'forbidden' });
              return;
            }
            if (!email) {
              sendJson(res, 400, { error: 'email required' });
              return;
            }
            const state = await playerStateStore.getPlayerStateByEmail(email);
            if (!state) {
              sendJson(res, 404, { error: 'not found' });
              return;
            }
            sendJson(res, 200, { state });
            return;
          }

          if (url === '/api/admin/user-db/status' && req.method === 'GET') {
            const adminEmail = new URL(req.url ?? '', 'http://local').searchParams.get('adminEmail') ?? '';
            if (!userStore.isAdminEmail(adminEmail)) {
              sendJson(res, 403, { error: 'forbidden' });
              return;
            }
            const storage = await userStore.checkConnection();
            const users = await userStore.listUsers();
            sendJson(res, 200, {
              storage,
              backend: userStore.type ?? 'file',
              dataDir: userStore.type === 'supabase' ? process.env.SUPABASE_URL : path.dirname(dbDir),
              logsDir: path.resolve(path.dirname(dbDir), 'user-logs'),
              userCount: users.length,
              registeredEmailCount: (await userStore.listRegisteredEmails()).length,
              registeredEmails: await userStore.listRegisteredEmails(),
              siteUrl: 'http://localhost:5173',
            });
            return;
          }

          if (url === '/api/admin/user-db/users' && req.method === 'GET') {
            const adminEmail = new URL(req.url ?? '', 'http://local').searchParams.get('adminEmail') ?? '';
            if (!userStore.isAdminEmail(adminEmail)) {
              sendJson(res, 403, { error: 'forbidden' });
              return;
            }
            sendJson(res, 200, { users: await userStore.listUsers() });
            return;
          }

          const userMatch = url.match(/^\/api\/admin\/user-db\/users\/([^/]+)$/);
          if (userMatch && req.method === 'GET') {
            const adminEmail = new URL(req.url ?? '', 'http://local').searchParams.get('adminEmail') ?? '';
            if (!userStore.isAdminEmail(adminEmail)) {
              sendJson(res, 403, { error: 'forbidden' });
              return;
            }
            const userId = decodeURIComponent(userMatch[1]);
            const user = await userStore.getUser(userId);
            if (!user) {
              sendJson(res, 404, { error: 'not found' });
              return;
            }
            sendJson(res, 200, { user, events: await userStore.getUserEvents(userId) });
            return;
          }

          const exportMatch = url.match(/^\/api\/admin\/user-db\/users\/([^/]+)\/export\.txt$/);
          if (exportMatch && req.method === 'GET') {
            const adminEmail = new URL(req.url ?? '', 'http://local').searchParams.get('adminEmail') ?? '';
            if (!userStore.isAdminEmail(adminEmail)) {
              sendJson(res, 403, { error: 'forbidden' });
              return;
            }
            const userId = decodeURIComponent(exportMatch[1]);
            if (!(await userStore.getUser(userId))) {
              sendJson(res, 404, { error: 'not found' });
              return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(await userStore.exportUserTxt(userId));
            return;
          }
        } catch (error) {
          console.error('[user-db-api]', error);
          sendJson(res, 500, { error: 'error' });
          return;
        }

        next();
      });
    },
  };
}
