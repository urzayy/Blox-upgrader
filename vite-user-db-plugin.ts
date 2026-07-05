import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { createUserDb } from './server/lib/userDb.mjs';

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
  const db = createUserDb(dbDir);

  function appendTxtLog(email: string, line: string) {
    const logsDir = path.resolve(path.dirname(dbDir), 'user-logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const sanitizeEmail = (value: string) => value.replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(logsDir, `${sanitizeEmail(email)}.txt`);
    if (!fs.existsSync(filePath) && line.startsWith('#')) {
      fs.writeFileSync(filePath, `${line}\n`, 'utf8');
    } else if (!fs.existsSync(filePath)) {
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

        if (url === '/api/auth/register' && req.method === 'POST') {
          try {
            const body = await readJsonBody(req) as {
              userId?: string;
              email?: string;
              passwordHash?: string;
              salt?: string;
              createdAt?: number;
              acceptedAge?: boolean;
              acceptedTerms?: boolean;
              nickname?: string;
            };
            if (!body.userId || !body.email || !body.passwordHash || !body.salt) {
              sendJson(res, 400, { error: 'bad request' });
              return;
            }
            const result = db.registerAccount({ ...body, isNewAccount: true });
            if (result?.line && body.email) appendTxtLog(body.email, result.line);
            sendJson(res, 200, { ok: true, user: result?.user ?? null });
          } catch {
            sendJson(res, 500, { error: 'error' });
          }
          return;
        }

        if (url === '/api/auth/login' && req.method === 'POST') {
          try {
            const body = await readJsonBody(req) as {
              userId?: string;
              email?: string;
              nickname?: string;
            };
            if (!body.userId || !body.email) {
              sendJson(res, 400, { error: 'bad request' });
              return;
            }
            const result = db.touchAccountLogin(body);
            if (result?.line && body.email) appendTxtLog(body.email, result.line);
            sendJson(res, 200, { ok: true, user: result?.user ?? null });
          } catch {
            sendJson(res, 500, { error: 'error' });
          }
          return;
        }

        if (url === '/api/users/sync' && req.method === 'POST') {
          try {
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
            const user = db.upsertUser(body);
            sendJson(res, 200, { ok: true, user });
          } catch {
            sendJson(res, 500, { error: 'error' });
          }
          return;
        }

        if (url === '/api/user-log' && req.method === 'POST') {
          try {
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
            const event = db.appendEvent(body);
            sendJson(res, 200, { ok: true, eventId: event.id });
          } catch {
            sendJson(res, 500, { error: 'error' });
          }
          return;
        }

        if (url === '/api/admin/user-db/users' && req.method === 'GET') {
          const adminEmail = new URL(req.url ?? '', 'http://local').searchParams.get('adminEmail') ?? '';
          if (!db.isAdminEmail(adminEmail)) {
            sendJson(res, 403, { error: 'forbidden' });
            return;
          }
          sendJson(res, 200, { users: db.listUsers() });
          return;
        }

        const userMatch = url.match(/^\/api\/admin\/user-db\/users\/([^/]+)$/);
        if (userMatch && req.method === 'GET') {
          const adminEmail = new URL(req.url ?? '', 'http://local').searchParams.get('adminEmail') ?? '';
          if (!db.isAdminEmail(adminEmail)) {
            sendJson(res, 403, { error: 'forbidden' });
            return;
          }
          const userId = decodeURIComponent(userMatch[1]);
          const user = db.getUser(userId);
          if (!user) {
            sendJson(res, 404, { error: 'not found' });
            return;
          }
          sendJson(res, 200, { user, events: db.getUserEvents(userId) });
          return;
        }

        const exportMatch = url.match(/^\/api\/admin\/user-db\/users\/([^/]+)\/export\.txt$/);
        if (exportMatch && req.method === 'GET') {
          const adminEmail = new URL(req.url ?? '', 'http://local').searchParams.get('adminEmail') ?? '';
          if (!db.isAdminEmail(adminEmail)) {
            sendJson(res, 403, { error: 'forbidden' });
            return;
          }
          const userId = decodeURIComponent(exportMatch[1]);
          if (!db.getUser(userId)) {
            sendJson(res, 404, { error: 'not found' });
            return;
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(db.exportUserTxt(userId));
          return;
        }

        next();
      });
    },
  };
}
