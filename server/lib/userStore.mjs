import { createUserDb } from './userDb.mjs';
import { createSupabaseDb } from './supabaseDb.mjs';

function wrapSync(db) {
  return {
    type: 'file',
    rootDir: db.rootDir,
    checkConnection: async () => {
      try {
        return { ok: true, path: db.rootDir };
      } catch (error) {
        return { ok: false, path: db.rootDir, error: error instanceof Error ? error.message : 'write failed' };
      }
    },
    registerAccount: async (payload) => db.registerAccount(payload),
    touchAccountLogin: async (payload) => db.touchAccountLogin(payload),
    upsertUser: async (payload) => db.upsertUser(payload),
    appendEvent: async (payload) => db.appendEvent(payload),
    listUsers: async () => db.listUsers(),
    listRegisteredEmails: async () => db.listRegisteredEmails(),
    getUser: async (userId) => db.getUser(userId),
    getUserEvents: async (userId, limit) => db.getUserEvents(userId, limit),
    exportUserTxt: async (userId) => db.exportUserTxt(userId),
    isAdminEmail: (email) => db.isAdminEmail(email),
    ADMIN_EMAILS: db.ADMIN_EMAILS,
  };
}

export function createUserStore({ userDbDir }) {
  const url = process.env.SUPABASE_URL?.trim();
  const secret = (
    process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || ''
  ).trim();

  if (url && secret) {
    return createSupabaseDb(url, secret);
  }

  return wrapSync(createUserDb(userDbDir));
}
