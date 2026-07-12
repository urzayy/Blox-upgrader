import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

const ADMIN_EMAILS = new Set(['urzay1v1@gmail.com', 'ecruzcastillo2009@gmail.com']);

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function nowMs() {
  return Date.now();
}

function eventId() {
  return `ev_${nowMs()}_${Math.random().toString(36).slice(2, 8)}`;
}

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname ?? null,
    createdAt: Number(row.created_at),
    lastSeenAt: Number(row.last_seen_at),
    eventCount: Number(row.event_count ?? 0),
    isNewAccount: Boolean(row.is_new_account),
  };
}

export function createSupabaseDb(url, secretKey) {
  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  async function bumpEventCount(userId, email) {
    const { data } = await supabase
      .from('blox_accounts')
      .select('event_count')
      .eq('id', userId)
      .maybeSingle();

    const nextCount = Number(data?.event_count ?? 0) + 1;
    await supabase
      .from('blox_accounts')
      .update({ event_count: nextCount, last_seen_at: nowMs(), email: normalizeEmail(email) })
      .eq('id', userId);

    return nextCount;
  }

  async function upsertUser({ userId, email, nickname, isNewAccount = false }) {
    const normalizedEmail = normalizeEmail(email);
    const ts = nowMs();

    const { data: existing } = await supabase
      .from('blox_accounts')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    const payload = {
      id: userId,
      email: normalizedEmail,
      nickname: nickname?.trim() || existing?.nickname || null,
      created_at: existing?.created_at ?? ts,
      last_seen_at: ts,
      event_count: existing?.event_count ?? 0,
      is_new_account: existing ? existing.is_new_account : Boolean(isNewAccount),
    };

    const { data, error } = await supabase
      .from('blox_accounts')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) throw error;
    return rowToUser(data);
  }

  function hashPassword(password, salt) {
    return createHash('sha256').update(`${salt}:${String(password)}`).digest('hex');
  }

  async function getAccountByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await supabase
      .from('blox_accounts')
      .select('id, email, password_hash, salt, nickname')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash,
      salt: data.salt,
      nickname: data.nickname,
    };
  }

  async function authenticateAccount({ email, password }) {
    const account = await getAccountByEmail(email);
    if (!account?.passwordHash || !account.salt) {
      return { ok: false, notFound: true };
    }
    const hash = hashPassword(password, account.salt);
    if (hash !== account.passwordHash) {
      return { ok: false, wrongPassword: true };
    }
    return {
      ok: true,
      userId: account.id,
      email: account.email,
      nickname: account.nickname ?? null,
      salt: account.salt,
    };
  }

  async function emailExistsOnServer(email) {
    const account = await getAccountByEmail(email);
    return Boolean(account);
  }

  async function registerAccount({
    userId,
    email,
    passwordHash,
    salt,
    createdAt,
    acceptedAge,
    acceptedTerms,
    nickname,
    isNewAccount = true,
  }) {
    const normalizedEmail = normalizeEmail(email);
    const ts = nowMs();

    const { data: byEmail } = await supabase
      .from('blox_accounts')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (byEmail?.id) {
      const { data: existingFull } = await supabase
        .from('blox_accounts')
        .select('id, password_hash')
        .eq('email', normalizedEmail)
        .maybeSingle();
      if (existingFull?.password_hash || existingFull?.id !== userId) {
        return { conflict: true };
      }
    }

    const payload = {
      id: userId,
      email: normalizedEmail,
      password_hash: passwordHash,
      salt,
      nickname: nickname?.trim() || null,
      created_at: createdAt ?? ts,
      last_seen_at: ts,
      last_login_at: ts,
      accepted_age: Boolean(acceptedAge),
      accepted_terms: Boolean(acceptedTerms),
      is_new_account: Boolean(isNewAccount),
      synced_from_client: false,
    };

    const { error } = await supabase.from('blox_accounts').upsert(payload, { onConflict: 'id' });
    if (error) throw error;

    const user = await upsertUser({ userId, email: normalizedEmail, nickname, isNewAccount });
    const line = `[${new Date().toLocaleString('en-US', { hour12: false })}] AUTH.register | email=${normalizedEmail}`;
    const event = await appendEvent({
      userId,
      email: normalizedEmail,
      line,
      action: 'AUTH.register',
      details: { email: normalizedEmail },
    });

    return { user, line: event.line };
  }

  async function touchAccountLogin({ userId, email, nickname }) {
    const normalizedEmail = normalizeEmail(email);
    const ts = nowMs();

    const { data: byEmail } = await supabase
      .from('blox_accounts')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    let resolvedUserId = byEmail?.id ?? userId;

    const { data: existing } = await supabase
      .from('blox_accounts')
      .select('*')
      .eq('id', resolvedUserId)
      .maybeSingle();

    if (!existing) {
      await supabase.from('blox_accounts').upsert({
        id: resolvedUserId,
        email: normalizedEmail,
        nickname: nickname?.trim() || null,
        created_at: ts,
        last_seen_at: ts,
        last_login_at: ts,
        synced_from_client: true,
        event_count: 0,
        is_new_account: false,
      }, { onConflict: 'id' });
    } else {
      await supabase.from('blox_accounts').update({
        last_seen_at: ts,
        last_login_at: ts,
        nickname: nickname?.trim() || existing.nickname,
        email: normalizedEmail,
      }).eq('id', resolvedUserId);
    }

    const user = await upsertUser({ userId: resolvedUserId, email: normalizedEmail, nickname, isNewAccount: false });
    const line = `[${new Date().toLocaleString('en-US', { hour12: false })}] AUTH.login | email=${normalizedEmail}`;
    const event = await appendEvent({
      userId: resolvedUserId,
      email: normalizedEmail,
      line,
      action: 'AUTH.login',
      details: { email: normalizedEmail },
    });

    return { user, line: event.line, canonicalUserId: resolvedUserId };
  }

  async function appendEvent({ userId, email, line, action, details }) {
    const normalizedEmail = normalizeEmail(email);
    let resolvedUserId = userId;

    if (!resolvedUserId) {
      const { data } = await supabase
        .from('blox_accounts')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();
      resolvedUserId = data?.id ?? `usr_anon_${nowMs()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    await upsertUser({ userId: resolvedUserId, email: normalizedEmail });

    const event = {
      id: eventId(),
      user_id: resolvedUserId,
      email: normalizedEmail,
      action: action || 'UNKNOWN',
      details: details && typeof details === 'object' ? details : {},
      line: line || '',
      created_at: nowMs(),
    };

    const { error } = await supabase.from('blox_user_events').insert(event);
    if (error) throw error;

    const eventCount = await bumpEventCount(resolvedUserId, normalizedEmail);

    return {
      id: event.id,
      userId: resolvedUserId,
      email: normalizedEmail,
      action: event.action,
      details: event.details,
      line: event.line,
      createdAt: event.created_at,
      eventCount,
    };
  }

  async function fetchAllAccountRows() {
    const pageSize = 1000;
    const allRows = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from('blox_accounts')
        .select('*')
        .order('last_seen_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) throw error;

      const batch = data ?? [];
      allRows.push(...batch);
      if (batch.length < pageSize) break;
      from += pageSize;
    }

    return allRows;
  }

  async function countAccounts() {
    const { count, error } = await supabase
      .from('blox_accounts')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;
    return count ?? 0;
  }

  function dedupeUsersByEmail(rows) {
    const byEmail = new Map();
    for (const row of rows) {
      const user = rowToUser(row);
      const prev = byEmail.get(user.email);
      if (!prev || user.lastSeenAt > prev.lastSeenAt) byEmail.set(user.email, user);
    }
    return [...byEmail.values()].sort((a, b) => b.lastSeenAt - a.lastSeenAt);
  }

  async function listUsers() {
    return dedupeUsersByEmail(await fetchAllAccountRows());
  }

  async function listRegisteredEmails() {
    const users = await listUsers();
    return users.map(u => u.email).sort((a, b) => a.localeCompare(b));
  }

  async function getUser(userId) {
    const { data, error } = await supabase
      .from('blox_accounts')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return rowToUser(data);
  }

  async function getUserEvents(userId, limit = 500) {
    const { data, error } = await supabase
      .from('blox_user_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map(row => ({
      id: row.id,
      userId: row.user_id,
      email: row.email,
      action: row.action,
      details: row.details ?? {},
      line: row.line,
      createdAt: Number(row.created_at),
    }));
  }

  async function exportUserTxt(userId) {
    const user = await getUser(userId);
    const events = (await getUserEvents(userId, 10_000)).slice().reverse();
    const header = [
      '# Blox Upgrader — Activity log',
      `# User: ${user?.email ?? 'unknown'}`,
      `# ID: ${userId}`,
      `# Events: ${events.length}`,
      '',
    ].join('\n');
    const body = events.map(e => e.line || `[${new Date(e.createdAt).toLocaleString('en-US')}] ${e.action}`).join('\n');
    return `${header}${body}\n`;
  }

  async function checkConnection() {
    const { error } = await supabase.from('blox_accounts').select('id').limit(1);
    if (error) {
      return { ok: false, path: 'supabase', error: error.message };
    }
    return { ok: true, path: 'supabase' };
  }

  async function clearUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    if (ADMIN_EMAILS.has(normalizedEmail)) {
      throw new Error('Cannot reset admin accounts');
    }

    const { data: account } = await supabase
      .from('blox_accounts')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    const userId = account?.id ?? null;
    if (userId) {
      await supabase.from('blox_user_events').delete().eq('user_id', userId);
    }
    await supabase.from('blox_user_events').delete().eq('email', normalizedEmail);
    await supabase.from('blox_accounts').delete().eq('email', normalizedEmail);

    return { cleared: Boolean(userId), userId };
  }

  function isAdminEmail(email) {
    return ADMIN_EMAILS.has(normalizeEmail(email));
  }

  return {
    type: 'supabase',
    rootDir: url,
    registerAccount,
    touchAccountLogin,
    authenticateAccount,
    emailExistsOnServer,
    getAccountByEmail,
    upsertUser,
    appendEvent,
    listUsers,
    listRegisteredEmails,
    countAccounts,
    getUser,
    getUserEvents,
    exportUserTxt,
    checkConnection,
    clearUserByEmail,
    isAdminEmail,
    ADMIN_EMAILS: [...ADMIN_EMAILS],
  };
}
