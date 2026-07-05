import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { withdrawChatPlugin } from './vite-withdraw-chat-plugin';
import { inventoryGrantsPlugin } from './vite-inventory-grants-plugin';
import { balanceGrantsPlugin } from './vite-balance-grants-plugin';
import { siteStatePlugin } from './vite-site-state-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.resolve(__dirname, 'user-logs');
const withdrawChatsDir = path.resolve(__dirname, 'withdraw-chats');
const inventoryGrantsDir = path.resolve(__dirname, 'inventory-grants');
const balanceGrantsDir = path.resolve(__dirname, 'balance-grants');
const siteStateDir = path.resolve(__dirname, 'site-state');

function sanitizeEmail(email: string): string {
  return email.replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function userLogsPlugin() {
  return {
    name: 'user-logs-writer',
    configureServer(server: { middlewares: { use: Function } }) {
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

      server.middlewares.use('/api/user-log', (req: { method?: string; on: Function }, res: { statusCode: number; end: (s?: string) => void }, next: () => void) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { email, line } = JSON.parse(body) as { email: string; line: string };
            if (!email || typeof line !== 'string') {
              res.statusCode = 400;
              res.end('bad request');
              return;
            }

            const filePath = path.join(logsDir, `${sanitizeEmail(email)}.txt`);
            if (!fs.existsSync(filePath) && line.startsWith('#')) {
              fs.writeFileSync(filePath, `${line}\n`, 'utf8');
            } else if (!fs.existsSync(filePath)) {
              fs.writeFileSync(
                filePath,
                `# Blox Upgrader — ${email}\n# Creado: ${new Date().toISOString()}\n\n${line}\n`,
                'utf8',
              );
            } else {
              fs.appendFileSync(filePath, `${line}\n`, 'utf8');
            }

            res.statusCode = 200;
            res.end('ok');
          } catch {
            res.statusCode = 500;
            res.end('error');
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), userLogsPlugin(), withdrawChatPlugin(withdrawChatsDir), inventoryGrantsPlugin(inventoryGrantsDir), balanceGrantsPlugin(balanceGrantsDir), siteStatePlugin(siteStateDir)],
  server: { port: 5173, open: true },
});
