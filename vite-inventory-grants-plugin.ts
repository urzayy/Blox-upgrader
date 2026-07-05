import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

interface GrantSkin {
  id: string;
  name: string;
  weapon: string;
  rarity: string;
  wear: string;
  price: number;
  image: string;
}

interface InventoryGrant {
  id: string;
  targetEmail: string;
  grantedBy: string;
  skin: GrantSkin;
  createdAt: number;
  status: 'pending' | 'applied';
}

interface GrantStore {
  email: string;
  grants: InventoryGrant[];
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
  const file = storePath(grantsDir, email);
  if (!fs.existsSync(file)) {
    return { email: email.trim().toLowerCase(), grants: [] };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as GrantStore;
    if (!parsed?.grants) return { email: email.trim().toLowerCase(), grants: [] };
    return parsed;
  } catch {
    return { email: email.trim().toLowerCase(), grants: [] };
  }
}

function saveStore(grantsDir: string, store: GrantStore) {
  if (!fs.existsSync(grantsDir)) fs.mkdirSync(grantsDir, { recursive: true });
  fs.writeFileSync(storePath(grantsDir, store.email), JSON.stringify(store, null, 2), 'utf8');
}

export function inventoryGrantsPlugin(grantsDir: string): Plugin {
  return {
    name: 'inventory-grants-api',
    configureServer(server) {
      if (!fs.existsSync(grantsDir)) fs.mkdirSync(grantsDir, { recursive: true });

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/inventory-grants')) return next();

        try {
          if (req.method === 'GET' && url.startsWith('/api/inventory-grants?')) {
            const query = new URL(url, 'http://local').searchParams;
            const email = query.get('email')?.trim().toLowerCase();
            if (!email) {
              sendJson(res, 400, { error: 'email required' });
              return;
            }
            const store = loadStore(grantsDir, email);
            const grants = store.grants.filter(g => g.status === 'pending');
            sendJson(res, 200, { grants });
            return;
          }

          if (req.method === 'POST' && url === '/api/inventory-grants/ack') {
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

          if (req.method === 'POST' && url === '/api/inventory-grants') {
            const body = JSON.parse(await readBody(req)) as {
              targetEmail: string;
              grantedBy: string;
              skin: GrantSkin;
              quantity?: number;
            };
            const targetEmail = body.targetEmail?.trim().toLowerCase();
            if (!targetEmail || !body.skin?.id || !body.grantedBy) {
              sendJson(res, 400, { error: 'invalid grant' });
              return;
            }
            const quantity = Math.min(99, Math.max(1, Math.floor(body.quantity ?? 1)));
            const store = loadStore(grantsDir, targetEmail);
            const now = Date.now();
            const grants: InventoryGrant[] = Array.from({ length: quantity }, (_, index) => ({
              id: `grant_${now}_${index}_${Math.random().toString(36).slice(2, 8)}`,
              targetEmail,
              grantedBy: body.grantedBy.trim().toLowerCase(),
              skin: body.skin,
              createdAt: now + index,
              status: 'pending' as const,
            }));
            store.grants.push(...grants);
            saveStore(grantsDir, store);
            sendJson(res, 200, { grants, quantity });
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
