import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = new Set(['urzay1v1@gmail.com', 'ecruzcastillo2009@gmail.com']);

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function sanitizeEmail(email) {
  return normalizeEmail(email).replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function isSkin(value) {
  return (
    value
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.weapon === 'string'
    && typeof value.rarity === 'string'
    && typeof value.wear === 'string'
    && typeof value.price === 'number'
    && typeof value.image === 'string'
  );
}

function normalizeInventory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isSkin).slice(0, 500);
}

function normalizeBalance(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function rowToState(row) {
  if (!row) return null;
  return {
    userId: row.id ?? row.user_id ?? null,
    email: normalizeEmail(row.email),
    balance: normalizeBalance(row.balance),
    inventory: normalizeInventory(row.inventory),
    updatedAt: Number(row.inventory_updated_at ?? row.updated_at ?? 0),
  };
}

export function createFilePlayerStateStore(rootDir) {
  if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

  const filePath = (email) => path.join(rootDir, `${sanitizeEmail(email)}.json`);

  function readState(email) {
    const file = filePath(email);
    if (!fs.existsSync(file)) return null;
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!parsed || typeof parsed !== 'object') return null;
      return {
        userId: typeof parsed.userId === 'string' ? parsed.userId : null,
        email: normalizeEmail(parsed.email ?? email),
        balance: normalizeBalance(parsed.balance),
        inventory: normalizeInventory(parsed.inventory),
        updatedAt: Number(parsed.updatedAt ?? 0),
      };
    } catch {
      return null;
    }
  }

  return {
    type: 'file',
    async savePlayerState({ userId, email, balance, inventory }) {
      const normalizedEmail = normalizeEmail(email);
      const payload = {
        userId,
        email: normalizedEmail,
        balance: normalizeBalance(balance),
        inventory: normalizeInventory(inventory),
        updatedAt: Date.now(),
      };
      fs.writeFileSync(filePath(normalizedEmail), JSON.stringify(payload, null, 2), 'utf8');
      return payload;
    },
    async getPlayerStateByEmail(email) {
      return readState(normalizeEmail(email));
    },
    isAdminEmail(email) {
      return ADMIN_EMAILS.has(normalizeEmail(email));
    },
  };
}

export function createSupabasePlayerStateStore(url, secretKey) {
  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  async function saveToAccounts({ userId, email, balance, inventory }) {
    const normalizedEmail = normalizeEmail(email);
    const ts = Date.now();
    const patch = {
      balance: normalizeBalance(balance),
      inventory: normalizeInventory(inventory),
      inventory_updated_at: ts,
      last_seen_at: ts,
    };

    const { data: existing } = await supabase
      .from('blox_accounts')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existing?.id) {
      const { data, error } = await supabase
        .from('blox_accounts')
        .update(patch)
        .eq('email', normalizedEmail)
        .select('id, email, balance, inventory, inventory_updated_at')
        .single();
      if (error) throw error;
      return rowToState(data);
    }

    const { data, error } = await supabase
      .from('blox_accounts')
      .upsert({
        id: userId,
        email: normalizedEmail,
        created_at: ts,
        last_seen_at: ts,
        event_count: 0,
        ...patch,
      }, { onConflict: 'id' })
      .select('id, email, balance, inventory, inventory_updated_at')
      .single();
    if (error) throw error;
    return rowToState(data);
  }

  async function readFromAccounts(email) {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await supabase
      .from('blox_accounts')
      .select('id, email, balance, inventory, inventory_updated_at')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const state = rowToState(data);
    if (!state?.updatedAt) return null;
    return state;
  }

  return {
    type: 'supabase',
    savePlayerState: saveToAccounts,
    getPlayerStateByEmail: readFromAccounts,
    isAdminEmail(email) {
      return ADMIN_EMAILS.has(normalizeEmail(email));
    },
  };
}

function supabaseErrorMessage(error) {
  if (!error) return 'unknown error';
  if (error instanceof Error) return error.message;
  if (typeof error.message === 'string') return error.message;
  return 'database error';
}

export function createHybridPlayerStateStore(fileStore, remoteStore) {
  return {
    type: remoteStore.type === 'supabase' ? 'hybrid-supabase' : remoteStore.type,
    async savePlayerState(payload) {
      const fileSaved = await fileStore.savePlayerState(payload);
      try {
        return await remoteStore.savePlayerState(payload);
      } catch (error) {
        console.error('[player-state] remote save failed, kept file copy:', supabaseErrorMessage(error));
        return fileSaved;
      }
    },
    async getPlayerStateByEmail(email) {
      try {
        const remote = await remoteStore.getPlayerStateByEmail(email);
        if (remote) return remote;
      } catch (error) {
        console.error('[player-state] remote read failed, trying file:', supabaseErrorMessage(error));
      }
      return fileStore.getPlayerStateByEmail(email);
    },
    isAdminEmail(email) {
      return fileStore.isAdminEmail(email);
    },
  };
}

export function createPlayerStateStore({ playerStateDir }) {
  const fileStore = createFilePlayerStateStore(playerStateDir);
  const url = process.env.SUPABASE_URL?.trim();
  const secret = (
    process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || ''
  ).trim();

  if (url && secret) {
    return createHybridPlayerStateStore(
      fileStore,
      createSupabasePlayerStateStore(url, secret),
    );
  }

  return fileStore;
}
