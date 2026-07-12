import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createUserStore } from '../server/lib/userStore.mjs';
import { createPlayerStateStore } from '../server/lib/playerStateStore.mjs';
import { createAccountResetMarkerStore } from '../server/lib/accountResetMarker.mjs';
import { resetPlayerProgressByEmail } from '../server/lib/accountReset.mjs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || ROOT;
const USER_DB_DIR = process.env.USER_DB_DIR || path.join(DATA_DIR, 'user-db');
const PLAYER_STATE_DIR = process.env.PLAYER_STATE_DIR || path.join(DATA_DIR, 'player-state');
const ACCOUNT_RESETS_DIR = process.env.ACCOUNT_RESETS_DIR || path.join(DATA_DIR, 'account-resets');

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function emailsFromPlayerStateDir(playerStateDir) {
  if (!fs.existsSync(playerStateDir)) return [];

  const emails = [];
  for (const file of fs.readdirSync(playerStateDir).filter(name => name.endsWith('.json'))) {
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(playerStateDir, file), 'utf8'));
      const email = normalizeEmail(parsed?.email ?? '');
      if (email) emails.push(email);
    } catch {
      /* skip corrupt player-state file */
    }
  }
  return emails;
}

async function main() {
  const userStore = createUserStore({ userDbDir: USER_DB_DIR });
  const playerStateStore = createPlayerStateStore({ playerStateDir: PLAYER_STATE_DIR });
  const resetMarkerStore = createAccountResetMarkerStore(ACCOUNT_RESETS_DIR);

  const registeredEmails = await userStore.listRegisteredEmails();
  const playerStateEmails = emailsFromPlayerStateDir(PLAYER_STATE_DIR);
  const allEmails = [...new Set([...registeredEmails, ...playerStateEmails].map(normalizeEmail))].sort();

  const skippedAdmins = [];
  const reset = [];

  for (const email of allEmails) {
    if (userStore.isAdminEmail(email) || playerStateStore.isAdminEmail(email)) {
      skippedAdmins.push(email);
      continue;
    }

    const result = await resetPlayerProgressByEmail(email, {
      playerStateStore,
      resetMarkerStore,
    });
    reset.push(result);
  }

  console.log(JSON.stringify({
    ok: true,
    resetCount: reset.length,
    skippedAdminCount: skippedAdmins.length,
    skippedAdmins,
    resetEmails: reset.map(entry => entry.email),
  }, null, 2));
}

main().catch((error) => {
  console.error('[reset-all-player-progress]', error);
  process.exit(1);
});
