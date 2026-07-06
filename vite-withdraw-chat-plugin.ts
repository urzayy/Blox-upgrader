import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const MIN_DEPOSIT_TOTAL = 40;

type WithdrawTicketStatus = 'open' | 'completed' | 'cancelled';

interface WithdrawSkinSummary {
  id: string;
  name: string;
  price: number;
  weapon: string;
  image: string;
  wear: string;
}

interface WithdrawTicket {
  id: string;
  userId: string;
  userEmail: string;
  userLabel: string;
  type?: 'withdraw' | 'deposit';
  skins: WithdrawSkinSummary[];
  total: number;
  status: WithdrawTicketStatus;
  createdAt: number;
  updatedAt: number;
}

interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderEmail: string;
  senderRole: 'user' | 'admin' | 'system';
  senderLabel: string;
  text: string;
  createdAt: number;
}

interface TicketBundle {
  ticket: WithdrawTicket;
  messages: ChatMessage[];
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

export function withdrawChatPlugin(chatsDir: string): Plugin {
  return {
    name: 'withdraw-chat-api',
    configureServer(server) {
      if (!fs.existsSync(chatsDir)) fs.mkdirSync(chatsDir, { recursive: true });

      const ticketPath = (id: string) => path.join(chatsDir, `${id}.json`);

      const loadBundle = (id: string): TicketBundle | null => {
        const file = ticketPath(id);
        if (!fs.existsSync(file)) return null;
        try {
          return JSON.parse(fs.readFileSync(file, 'utf8')) as TicketBundle;
        } catch {
          return null;
        }
      };

      const saveBundle = (bundle: TicketBundle) => {
        fs.writeFileSync(ticketPath(bundle.ticket.id), JSON.stringify(bundle, null, 2), 'utf8');
      };

      const listTickets = (filter?: { userId?: string; openOnly?: boolean }): WithdrawTicket[] => {
        const files = fs.readdirSync(chatsDir).filter(f => f.endsWith('.json'));
        const tickets: WithdrawTicket[] = [];
        for (const file of files) {
          try {
            const bundle = JSON.parse(fs.readFileSync(path.join(chatsDir, file), 'utf8')) as TicketBundle;
            if (!bundle?.ticket) continue;
            if (filter?.userId && bundle.ticket.userId !== filter.userId) continue;
            if (filter?.openOnly && bundle.ticket.status !== 'open') continue;
            tickets.push(bundle.ticket);
          } catch {
            /* skip corrupt file */
          }
        }
        return tickets.sort((a, b) => b.updatedAt - a.updatedAt);
      };

      const countUnreadUserMessages = (messages: ChatMessage[], lastReadAt: number) =>
        messages.filter(message => message.senderRole === 'user' && message.createdAt > lastReadAt).length;

      const buildAdminInbox = (lastReadByTicket: Record<string, number> = {}) => {
        const tickets = listTickets({ openOnly: true });
        return tickets.map(ticket => {
          const bundle = loadBundle(ticket.id);
          const messages = bundle?.messages ?? [];
          const userMessages = messages.filter(message => message.senderRole === 'user');
          const lastUserMessage = userMessages.length
            ? userMessages.reduce((latest, message) => (
              message.createdAt > latest.createdAt ? message : latest
            ))
            : null;
          const lastUserMessageAt = lastUserMessage?.createdAt ?? 0;
          const storedRead = lastReadByTicket[ticket.id];
          const unreadCount = storedRead === undefined
            ? Math.max(1, userMessages.length)
            : countUnreadUserMessages(messages, storedRead);
          return {
            ticket,
            unreadCount,
            lastUserMessageAt,
            lastUserMessageText: lastUserMessage?.text?.slice(0, 160) ?? null,
            isUnseen: storedRead === undefined,
          };
        });
      };

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/withdraw/')) return next();

        try {
          if (req.method === 'POST' && url === '/api/withdraw/admin-inbox') {
            const body = JSON.parse(await readBody(req)) as { lastReadByTicket?: Record<string, number> };
            sendJson(res, 200, { items: buildAdminInbox(body.lastReadByTicket ?? {}) });
            return;
          }

          if (req.method === 'GET' && url.startsWith('/api/withdraw/tickets?')) {
            const query = new URL(url, 'http://local').searchParams;
            const userId = query.get('userId');
            const admin = query.get('admin') === '1';
            const all = query.get('all') === '1';
            const tickets = admin
              ? listTickets(all ? undefined : { openOnly: true })
              : listTickets(userId ? { userId } : undefined);
            sendJson(res, 200, { tickets });
            return;
          }

          const ticketMatch = url.match(/^\/api\/withdraw\/tickets\/([^/?]+)(\/messages)?$/);
          if (ticketMatch) {
            const ticketId = decodeURIComponent(ticketMatch[1]);

            if (req.method === 'GET' && !ticketMatch[2]) {
              const bundle = loadBundle(ticketId);
              if (!bundle) {
                sendJson(res, 404, { error: 'not found' });
                return;
              }
              sendJson(res, 200, bundle);
              return;
            }

            if (req.method === 'POST' && ticketMatch[2] === '/messages') {
              const bundle = loadBundle(ticketId);
              if (!bundle) {
                sendJson(res, 404, { error: 'not found' });
                return;
              }
              const body = JSON.parse(await readBody(req)) as {
                senderId: string;
                senderEmail: string;
                senderRole: 'user' | 'admin';
                senderLabel: string;
                text: string;
              };
              if (!body.text?.trim()) {
                sendJson(res, 400, { error: 'empty message' });
                return;
              }
              const now = Date.now();
              const message: ChatMessage = {
                id: `msg_${now}_${Math.random().toString(36).slice(2, 7)}`,
                ticketId,
                senderId: body.senderId,
                senderEmail: body.senderEmail,
                senderRole: body.senderRole,
                senderLabel: body.senderLabel || (body.senderRole === 'admin' ? 'Admin' : 'User'),
                text: body.text.trim(),
                createdAt: now,
              };
              bundle.messages.push(message);
              bundle.ticket.updatedAt = now;
              saveBundle(bundle);
              sendJson(res, 200, bundle);
              return;
            }

            if (req.method === 'PATCH' && !ticketMatch[2]) {
              const bundle = loadBundle(ticketId);
              if (!bundle) {
                sendJson(res, 404, { error: 'not found' });
                return;
              }
              const body = JSON.parse(await readBody(req)) as { status: WithdrawTicketStatus };
              if (!['open', 'completed', 'cancelled'].includes(body.status)) {
                sendJson(res, 400, { error: 'invalid status' });
                return;
              }
              const now = Date.now();
              bundle.ticket.status = body.status;
              bundle.ticket.updatedAt = now;
              const ticketType = bundle.ticket.type ?? 'withdraw';
              const statusText = body.status === 'completed'
                ? ticketType === 'deposit'
                  ? 'Deposit completed. The amount has been added to your SALDO.'
                  : 'Withdrawal completed. The selected skins have been removed from your inventory.'
                : body.status === 'cancelled'
                  ? ticketType === 'deposit'
                    ? 'Deposit request cancelled.'
                    : 'Withdrawal request cancelled. Your skins remain in your inventory.'
                  : 'Request reopened.';
              bundle.messages.push({
                id: `msg_${now}_sys`,
                ticketId,
                senderId: 'system',
                senderEmail: 'system@blox-upgrader',
                senderRole: 'system',
                senderLabel: 'System',
                text: statusText,
                createdAt: now,
              });
              saveBundle(bundle);
              sendJson(res, 200, bundle);
              return;
            }
          }

          if (req.method === 'POST' && url === '/api/withdraw/tickets') {
            const body = JSON.parse(await readBody(req)) as {
              type?: 'withdraw' | 'deposit';
              userId: string;
              userEmail: string;
              userLabel: string;
              skins?: WithdrawSkinSummary[];
              amount?: number;
              total?: number;
            };
            if (!body.userId) {
              sendJson(res, 400, { error: 'invalid ticket' });
              return;
            }

            const now = Date.now();
            const ticketType = body.type ?? 'withdraw';

            if (ticketType === 'deposit') {
              const skins = body.skins ?? [];
              const total = skins.reduce((sum, s) => sum + s.price, 0);
              if (!skins.length || !Number.isFinite(total) || total < MIN_DEPOSIT_TOTAL) {
                sendJson(res, 400, { error: 'invalid deposit' });
                return;
              }
              const ticketId = `dp_${now}_${Math.random().toString(36).slice(2, 8)}`;
              const ticket: WithdrawTicket = {
                id: ticketId,
                userId: body.userId,
                userEmail: body.userEmail,
                userLabel: body.userLabel || body.userEmail,
                type: 'deposit',
                skins,
                total,
                status: 'open',
                createdAt: now,
                updatedAt: now,
              };
              const grouped = new Map<string, { name: string; price: number; qty: number }>();
              for (const skin of skins) {
                const key = skin.id;
                const existing = grouped.get(key);
                if (existing) {
                  existing.qty += 1;
                } else {
                  grouped.set(key, { name: skin.name, price: skin.price, qty: 1 });
                }
              }
              const skinList = Array.from(grouped.values())
                .map(s => `• ${s.qty > 1 ? `${s.qty}× ` : ''}${s.name} (${(s.price * s.qty).toLocaleString('es-ES')})`)
                .join('\n');
              const messages: ChatMessage[] = [{
                id: `msg_${now}_welcome`,
                ticketId,
                senderId: 'system',
                senderEmail: 'system@blox-upgrader',
                senderRole: 'system',
                senderLabel: 'System',
                text: `Deposit request received (${total.toLocaleString('es-ES')} coins).\n\n${skinList}\n\nAn administrator will assist you live. Follow their payment instructions here.`,
                createdAt: now,
              }];
              const bundle: TicketBundle = { ticket, messages };
              saveBundle(bundle);
              sendJson(res, 200, bundle);
              return;
            }

            if (!body.skins?.length) {
              sendJson(res, 400, { error: 'invalid ticket' });
              return;
            }
            const ticketId = `wd_${now}_${Math.random().toString(36).slice(2, 8)}`;
            const total = body.skins.reduce((sum, s) => sum + s.price, 0);
            const ticket: WithdrawTicket = {
              id: ticketId,
              userId: body.userId,
              userEmail: body.userEmail,
              userLabel: body.userLabel || body.userEmail,
              type: 'withdraw',
              skins: body.skins,
              total,
              status: 'open',
              createdAt: now,
              updatedAt: now,
            };
            const skinList = body.skins.map(s => `• ${s.name} (${s.price.toLocaleString('es-ES')})`).join('\n');
            const messages: ChatMessage[] = [{
              id: `msg_${now}_welcome`,
              ticketId,
              senderId: 'system',
              senderEmail: 'system@blox-upgrader',
              senderRole: 'system',
              senderLabel: 'System',
              text: `Withdraw request received (${body.skins.length} skins · ${total.toLocaleString('es-ES')}).\n\n${skinList}\n\nAn administrator will assist you live. Please follow their instructions here.`,
              createdAt: now,
            }];
            const bundle: TicketBundle = { ticket, messages };
            saveBundle(bundle);
            sendJson(res, 200, bundle);
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
