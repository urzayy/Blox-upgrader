import { createUserDb } from './userDb.mjs';
import { createSupabaseDb } from './supabaseDb.mjs';
import { createAdminEmailsStore } from './adminEmailsStore.mjs';
import path from 'node:path';

function wrapSync(db, adminEmailsStore) {
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
    authenticateAccount: async (payload) => db.authenticateAccount(payload),
    emailExistsOnServer: async (email) => db.emailExistsOnServer(email),
    getAccountByEmail: async (email) => db.getAccountByEmail(email),
    upsertUser: async (payload) => db.upsertUser(payload),
    appendEvent: async (payload) => db.appendEvent(payload),
    listUsers: async () => db.listUsers(),
    listRegisteredEmails: async () => db.listRegisteredEmails(),
    countAccounts: async () => db.listUsers().then(users => users.length),
    getUser: async (userId) => db.getUser(userId),
    getUserEvents: async (userId, limit) => db.getUserEvents(userId, limit),
    exportUserTxt: async (userId) => db.exportUserTxt(userId),
    clearUserByEmail: async (email) => db.clearUserByEmail(email),
    resetAccountPassword: async (payload) => db.resetAccountPassword(payload),
    isAdminEmail: (email) => adminEmailsStore.isAdminEmail(email),
    get ADMIN_EMAILS() {
      return adminEmailsStore.listAdmins();
    },
  };
}

function wrapRemote(db, adminEmailsStore) {
  return {
    ...db,
    isAdminEmail: (email) => adminEmailsStore.isAdminEmail(email),
    get ADMIN_EMAILS() {
      return adminEmailsStore.listAdmins();
    },
  };
}

export function createUserStore({ userDbDir, adminEmailsStore }) {
  const resolvedAdminEmailsStore = adminEmailsStore
    ?? createAdminEmailsStore(path.join(path.dirname(userDbDir), 'site-state'));
  const url = process.env.SUPABASE_URL?.trim();
  const secret = (
    process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || ''
  ).trim();

  if (url && secret) {
    return wrapRemote(createSupabaseDb(url, secret, resolvedAdminEmailsStore), resolvedAdminEmailsStore);
  }

  return wrapSync(createUserDb(userDbDir, resolvedAdminEmailsStore), resolvedAdminEmailsStore);
}
