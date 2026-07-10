import fs from 'node:fs';
import path from 'node:path';

function sanitizeEmail(email) {
  return String(email ?? '').trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
}

function grantsPath(grantsDir, email) {
  return path.join(grantsDir, `${sanitizeEmail(email)}.json`);
}

export function createInventoryGrantStore(grantsDir) {
  if (!fs.existsSync(grantsDir)) fs.mkdirSync(grantsDir, { recursive: true });

  function loadStore(email) {
    const normalized = String(email ?? '').trim().toLowerCase();
    const file = grantsPath(grantsDir, normalized);
    if (!fs.existsSync(file)) return { email: normalized, grants: [] };
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!parsed?.grants) return { email: normalized, grants: [] };
      return parsed;
    } catch {
      return { email: normalized, grants: [] };
    }
  }

  function saveStore(store) {
    fs.writeFileSync(grantsPath(grantsDir, store.email), JSON.stringify(store, null, 2), 'utf8');
  }

  function createPendingGrant({ targetEmail, grantedBy, skin, quantity = 1 }) {
    const normalized = String(targetEmail ?? '').trim().toLowerCase();
    const by = String(grantedBy ?? '').trim().toLowerCase();
    if (!normalized || !by || !skin?.id) return { error: 'invalid_grant' };

    const store = loadStore(normalized);
    const now = Date.now();
    const grants = Array.from({ length: Math.min(99, Math.max(1, Math.floor(quantity))) }, (_, index) => ({
      id: `grant_${now}_${index}_${Math.random().toString(36).slice(2, 8)}`,
      targetEmail: normalized,
      grantedBy: by,
      skin,
      createdAt: now + index,
      status: 'pending',
    }));
    store.grants.push(...grants);
    saveStore(store);
    return { ok: true, grants };
  }

  return { createPendingGrant };
}
