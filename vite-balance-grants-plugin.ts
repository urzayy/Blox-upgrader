import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

interface BalanceGrant {
  id: string;
  targetEmail: string;
  grantedBy: string;
  amount: number;
  createdAt: number;
  status: 'pending' | 'applied';
}

interface GrantStore {
  email: string;
  grants: BalanceGrant[];
}

function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_');
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

function storePath(grantsDir: string, email: string): string {
  return path.join(grantsDir, `${sanitizeEmail(email)}.json`);
}

function loadStore(grantsDir: string, email: string): GrantStore {
  const normalized = email.trim().toLowerCase();
  const file = storePath(grantsDir, normalized);
  if (!fs.existsSync(file)) return { email: normalized, grants: [] };
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as GrantStore;
    if (!parsed?.grants) return { email: normalized, grants: [] };
    return parsed;
  } catch {
    return { email: normalized, grants: [] };
  }
}

function saveStore(grantsDir: string, store: GrantStore) {
  if (!fs.existsSync(grantsDir)) fs.mkdirSync(grantsDir, { recursive: true });
  fs.writeFileSync(storePath(grantsDir, store.email), JSON.stringify(store, null, 2), 'utf8');
}

export function balanceGrantsPlugin(grantsDir: string): Plugin {
  return {
    name: 'balance-grants-api',
    configureServer(server) {
      if (!fs.existsSync(grantsDir)) fs.mkdirSync(grantsDir, { recursive: true });

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/balance-grants')) return next();

        try {
          if (req.method === 'GET' && url.startsWith('/api/balance-grants?')) {
            const query = new URL(url, 'http://local').searchParams;
            const email = query.get('email')?.trim().toLowerCase();
            if (!email) {
              sendJson(res, 400, { error: 'email required' });
              return;
            }
            const store = loadStore(grantsDir, email);
            sendJson(res, 200, { grants: store.grants.filter(g => g.status === 'pending') });
            return;
          }

          if (req.method === 'POST' && url === '/api/balance-grants/ack') {
            const body = JSON.parse(await readBody(req)) as { email: string; grantIds: string[] };
            const email = body.email?.trim().toLowerCase();
            if (!email || !Array.isArray(body.grantIds)) {
              sendJson(res, 400, { error: 'invalid ack' });
              return;
            }
            const store = loadStore(grantsDir, email);
            const ids = new Set(body.grantIds);
            store.grants = store.grants.map(g =>
              ids.has(g.id) ? { ...g, status: 'applied' as const } : g,
            );
            saveStore(grantsDir, store);
            sendJson(res, 200, { ok: true });
            return;
          }

          if (req.method === 'POST' && url === '/api/balance-grants') {
            const body = JSON.parse(await readBody(req)) as {
              targetEmail: string;
              grantedBy: string;
              amount: number;
            };
            const targetEmail = body.targetEmail?.trim().toLowerCase();
            const grantedBy = body.grantedBy?.trim().toLowerCase();
            const amount = Number(body.amount);
            if (!targetEmail || !grantedBy || !Number.isFinite(amount) || amount <= 0) {
              sendJson(res, 400, { error: 'invalid grant' });
              return;
            }
            const store = loadStore(grantsDir, targetEmail);
            const now = Date.now();
            const grant: BalanceGrant = {
              id: `bal_${now}_${Math.random().toString(36).slice(2, 8)}`,
              targetEmail,
              grantedBy,
              amount: Math.floor(amount),
              createdAt: now,
              status: 'pending',
            };
            store.grants.push(grant);
            saveStore(grantsDir, store);
            sendJson(res, 200, { grant });
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
