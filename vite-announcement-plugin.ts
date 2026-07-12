import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { createAnnouncementStore } from './server/lib/announcementStore.mjs';
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

export function announcementPlugin(announcementsDir: string, userDbDir: string): Plugin {
  if (!fs.existsSync(announcementsDir)) fs.mkdirSync(announcementsDir, { recursive: true });
  const announcementStore = createAnnouncementStore(announcementsDir);
  const userStore = createUserStore({ userDbDir });

  return {
    name: 'announcement-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';

        try {
          if (url === '/api/announcement/active' && req.method === 'GET') {
            sendJson(res, 200, { announcement: announcementStore.getActive() });
            return;
          }

          if (url === '/api/admin/announcement' && req.method === 'GET') {
            const query = new URL(req.url ?? '', 'http://localhost').searchParams;
            const adminEmail = String(query.get('adminEmail') ?? '').trim();
            if (!userStore.isAdminEmail(adminEmail)) {
              sendJson(res, 403, { error: 'forbidden' });
              return;
            }
            sendJson(res, 200, { announcement: announcementStore.getActive() });
            return;
          }

          if (url === '/api/admin/announcement' && req.method === 'POST') {
            const body = await readJsonBody(req) as {
              adminEmail?: string;
              title?: string;
              message?: string;
            };
            if (!userStore.isAdminEmail(String(body.adminEmail ?? '').trim())) {
              sendJson(res, 403, { error: 'forbidden' });
              return;
            }
            const result = announcementStore.publish({
              title: body.title,
              message: body.message,
              createdBy: body.adminEmail,
            });
            if (result.error) {
              sendJson(res, 400, { error: result.error });
              return;
            }
            sendJson(res, 200, result);
            return;
          }

          if (url === '/api/admin/announcement/clear' && req.method === 'POST') {
            const body = await readJsonBody(req) as { adminEmail?: string };
            if (!userStore.isAdminEmail(String(body.adminEmail ?? '').trim())) {
              sendJson(res, 403, { error: 'forbidden' });
              return;
            }
            sendJson(res, 200, announcementStore.clear());
            return;
          }

          next();
        } catch (error) {
          console.error('[announcement-api]', error);
          sendJson(res, 500, { error: 'internal_error' });
        }
      });
    },
  };
}
