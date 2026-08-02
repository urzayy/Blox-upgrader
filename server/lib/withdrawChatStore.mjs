import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function countUnreadUserMessages(messages, lastReadAt) {
  return messages.filter(message => message.senderRole === 'user' && message.createdAt > lastReadAt).length;
}

function buildInboxItems(tickets, loadBundle, lastReadByTicket = {}) {
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
}

export function createFileWithdrawChatStore(chatsDir) {
  if (!fs.existsSync(chatsDir)) fs.mkdirSync(chatsDir, { recursive: true });

  function ticketPath(id) {
    return path.join(chatsDir, `${id}.json`);
  }

  function loadBundleSync(id) {
    const file = ticketPath(id);
    if (!fs.existsSync(file)) return null;
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      return null;
    }
  }

  return {
    type: 'file',
    async loadBundle(id) {
      return loadBundleSync(id);
    },
    async saveBundle(bundle) {
      fs.writeFileSync(ticketPath(bundle.ticket.id), JSON.stringify(bundle, null, 2), 'utf8');
      return bundle;
    },
    async listTickets(filter) {
      const files = fs.readdirSync(chatsDir).filter(f => f.endsWith('.json'));
      const tickets = [];
      for (const file of files) {
        try {
          const bundle = JSON.parse(fs.readFileSync(path.join(chatsDir, file), 'utf8'));
          if (!bundle?.ticket) continue;
          if (filter?.userId && bundle.ticket.userId !== filter.userId) continue;
          if (filter?.openOnly && bundle.ticket.status !== 'open') continue;
          tickets.push(bundle.ticket);
        } catch {
          /* skip corrupt file */
        }
      }
      return tickets.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    async buildAdminInbox(lastReadByTicket = {}) {
      const tickets = await this.listTickets({ openOnly: true });
      return buildInboxItems(tickets, loadBundleSync, lastReadByTicket);
    },
  };
}

export function createSupabaseWithdrawChatStore(url, secretKey) {
  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  async function listBundles(filter) {
    let query = supabase.from('blox_withdraw_chats').select('bundle');
    if (filter?.userId) query = query.eq('user_id', filter.userId);
    const { data, error } = await query;
    if (error) throw error;
    let bundles = (data ?? []).map(row => row.bundle).filter(Boolean);
    if (filter?.openOnly) {
      bundles = bundles.filter(bundle => bundle.ticket?.status === 'open');
    }
    return bundles;
  }

  return {
    type: 'supabase',
    async loadBundle(id) {
      const { data, error } = await supabase
        .from('blox_withdraw_chats')
        .select('bundle')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data?.bundle ?? null;
    },
    async saveBundle(bundle) {
      const ticket = bundle.ticket;
      const { error } = await supabase
        .from('blox_withdraw_chats')
        .upsert({
          id: ticket.id,
          user_id: ticket.userId,
          bundle,
          updated_at: ticket.updatedAt || Date.now(),
        }, { onConflict: 'id' });
      if (error) throw error;
      return bundle;
    },
    async listTickets(filter) {
      const bundles = await listBundles(filter);
      return bundles
        .map(bundle => bundle.ticket)
        .filter(Boolean)
        .sort((a, b) => b.updatedAt - a.updatedAt);
    },
    async buildAdminInbox(lastReadByTicket = {}) {
      const bundles = await listBundles({ openOnly: true });
      const bundleById = new Map(bundles.map(bundle => [bundle.ticket.id, bundle]));
      const tickets = bundles.map(bundle => bundle.ticket).filter(Boolean);
      return buildInboxItems(tickets, (id) => bundleById.get(id) ?? null, lastReadByTicket);
    },
  };
}

function supabaseErrorMessage(error) {
  if (!error) return 'unknown error';
  if (error instanceof Error) return error.message;
  if (typeof error.message === 'string') return error.message;
  return 'database error';
}

export function createHybridWithdrawChatStore(fileStore, remoteStore) {
  return {
    type: remoteStore.type === 'supabase' ? 'hybrid-supabase' : remoteStore.type,
    async loadBundle(id) {
      try {
        const remote = await remoteStore.loadBundle(id);
        if (remote) return remote;
      } catch (error) {
        console.error('[withdraw-chat] remote read failed, trying file:', supabaseErrorMessage(error));
      }
      return fileStore.loadBundle(id);
    },
    async saveBundle(bundle) {
      await fileStore.saveBundle(bundle);
      try {
        await remoteStore.saveBundle(bundle);
      } catch (error) {
        console.error('[withdraw-chat] remote save failed, kept file copy:', supabaseErrorMessage(error));
      }
      return bundle;
    },
    async listTickets(filter) {
      try {
        return await remoteStore.listTickets(filter);
      } catch (error) {
        console.error('[withdraw-chat] remote list failed, trying file:', supabaseErrorMessage(error));
        return fileStore.listTickets(filter);
      }
    },
    async buildAdminInbox(lastReadByTicket = {}) {
      try {
        return await remoteStore.buildAdminInbox(lastReadByTicket);
      } catch (error) {
        console.error('[withdraw-chat] remote inbox failed, trying file:', supabaseErrorMessage(error));
        return fileStore.buildAdminInbox(lastReadByTicket);
      }
    },
  };
}

export function createWithdrawChatStore({ chatsDir }) {
  const fileStore = createFileWithdrawChatStore(chatsDir);
  const url = process.env.SUPABASE_URL?.trim();
  const secret = (
    process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || ''
  ).trim();

  if (url && secret) {
    return createHybridWithdrawChatStore(
      fileStore,
      createSupabaseWithdrawChatStore(url, secret),
    );
  }

  return fileStore;
}
