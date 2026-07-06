import fs from 'node:fs';
import path from 'node:path';

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function sanitizeEmail(email) {
  return normalizeEmail(email).replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function createAccountResetMarkerStore(rootDir) {
  if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

  const filePath = (email) => path.join(rootDir, `${sanitizeEmail(email)}.json`);

  return {
    markReset(email) {
      const normalizedEmail = normalizeEmail(email);
      const resetAt = Date.now();
      fs.writeFileSync(
        filePath(normalizedEmail),
        JSON.stringify({ email: normalizedEmail, resetAt }, null, 2),
        'utf8',
      );
      return resetAt;
    },
    getResetAt(email) {
      const file = filePath(normalizeEmail(email));
      if (!fs.existsSync(file)) return null;
      try {
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
        const resetAt = Number(parsed?.resetAt ?? 0);
        return Number.isFinite(resetAt) && resetAt > 0 ? resetAt : null;
      } catch {
        return null;
      }
    },
    clearReset(email) {
      const file = filePath(normalizeEmail(email));
      if (fs.existsSync(file)) fs.unlinkSync(file);
    },
  };
}
