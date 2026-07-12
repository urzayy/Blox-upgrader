import fs from 'node:fs';
import path from 'node:path';

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function sanitizeEmail(email) {
  return normalizeEmail(email).replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function deleteFileIfExists(filePath) {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function clearWithdrawChatsForEmail(chatsDir, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!fs.existsSync(chatsDir)) return 0;

  let removed = 0;
  for (const file of fs.readdirSync(chatsDir).filter(name => name.endsWith('.json'))) {
    try {
      const bundle = JSON.parse(fs.readFileSync(path.join(chatsDir, file), 'utf8'));
      if (normalizeEmail(bundle?.ticket?.userEmail ?? '') !== normalizedEmail) continue;
      fs.unlinkSync(path.join(chatsDir, file));
      removed += 1;
    } catch {
      /* skip corrupt chat file */
    }
  }
  return removed;
}

export async function resetPlayerProgressByEmail(email, {
  playerStateStore,
  resetMarkerStore,
}) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error('Email required');
  }

  const resetAt = resetMarkerStore?.markReset(normalizedEmail) ?? Date.now();
  const state = await playerStateStore.clearByEmail(normalizedEmail);

  return {
    ok: true,
    email: normalizedEmail,
    userId: state?.userId ?? null,
    resetAt,
    balance: 0,
    inventoryCount: 0,
  };
}

export async function clearAccountByEmail(email, {
  userStore,
  playerStateStore,
  resetMarkerStore,
  logsDir,
  grantsDir,
  balanceGrantsDir,
  chatsDir,
}) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error('Email required');
  }
  if (userStore.isAdminEmail(normalizedEmail)) {
    throw new Error('Cannot reset admin accounts');
  }

  const resetAt = resetMarkerStore?.markReset(normalizedEmail) ?? Date.now();
  await playerStateStore.clearByEmail(normalizedEmail);

  deleteFileIfExists(path.join(logsDir, `${sanitizeEmail(normalizedEmail)}.txt`));
  deleteFileIfExists(path.join(grantsDir, `${sanitizeEmail(normalizedEmail)}.json`));
  deleteFileIfExists(path.join(balanceGrantsDir, `${sanitizeEmail(normalizedEmail)}.json`));
  const chatsRemoved = clearWithdrawChatsForEmail(chatsDir, normalizedEmail);

  const userResult = await userStore.clearUserByEmail(normalizedEmail);
  await playerStateStore.clearByEmail(normalizedEmail);

  return {
    ok: true,
    email: normalizedEmail,
    userId: userResult.userId,
    clearedAccount: userResult.cleared,
    chatsRemoved,
    resetAt,
    balance: 0,
    inventoryCount: 0,
  };
}
