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

  return {
    type: 'supabase',
    async savePlayerState({ userId, email, balance, inventory }) {
      const normalizedEmail = normalizeEmail(email);
      const payload = {
        user_id: userId,
        email: normalizedEmail,
        balance: normalizeBalance(balance),
        inventory: normalizeInventory(inventory),
        updated_at: Date.now(),
      };
      const { data, error } = await supabase
        .from('blox_player_state')
        .upsert(payload, { onConflict: 'email' })
        .select('*')
        .single();
      if (error) throw error;
      return {
        userId: data.user_id,
        email: data.email,
        balance: Number(data.balance),
        inventory: normalizeInventory(data.inventory),
        updatedAt: Number(data.updated_at),
      };
    },
    async getPlayerStateByEmail(email) {
      const normalizedEmail = normalizeEmail(email);
      const { data, error } = await supabase
        .from('blox_player_state')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        userId: data.user_id,
        email: data.email,
        balance: Number(data.balance),
        inventory: normalizeInventory(data.inventory),
        updatedAt: Number(data.updated_at),
      };
    },
    isAdminEmail(email) {
      return ADMIN_EMAILS.has(normalizeEmail(email));
    },
  };
}

export function createPlayerStateStore({ playerStateDir }) {
  const url = process.env.SUPABASE_URL?.trim();
  const secret = (
    process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || ''
  ).trim();

  if (url && secret) {
    return createSupabasePlayerStateStore(url, secret);
  }

  return createFilePlayerStateStore(playerStateDir);
}
