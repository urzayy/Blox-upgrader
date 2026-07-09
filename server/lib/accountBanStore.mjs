import fs from 'node:fs';
import path from 'node:path';

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function sanitizeEmail(email) {
  return normalizeEmail(email).replace(/@/g, '_at_').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function isActiveBan(ban, now = Date.now()) {
  if (!ban) return false;
  const bannedUntil = ban.bannedUntil;
  if (bannedUntil == null) return true;
  return Number(bannedUntil) > now;
}

export function createAccountBanStore(rootDir) {
  if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

  const filePath = (email) => path.join(rootDir, `${sanitizeEmail(email)}.json`);

  return {
    banUser(email, { bannedBy, days, reason }) {
      const normalizedEmail = normalizeEmail(email);
      const bannedAt = Date.now();
      const isPermanent = days == null || days <= 0;
      const bannedUntil = isPermanent ? null : bannedAt + Number(days) * 86_400_000;
      const ban = {
        email: normalizedEmail,
        bannedAt,
        bannedUntil,
        bannedBy: normalizeEmail(bannedBy),
        reason: String(reason ?? '').trim() || null,
        days: isPermanent ? null : Number(days),
        permanent: isPermanent,
      };
      fs.writeFileSync(filePath(normalizedEmail), JSON.stringify(ban, null, 2), 'utf8');
      return ban;
    },

    unbanUser(email) {
      const normalizedEmail = normalizeEmail(email);
      const file = filePath(normalizedEmail);
      if (fs.existsSync(file)) fs.unlinkSync(file);
      return { email: normalizedEmail, unbanned: true };
    },

    getBan(email) {
      const file = filePath(normalizeEmail(email));
      if (!fs.existsSync(file)) return null;
      try {
        const ban = JSON.parse(fs.readFileSync(file, 'utf8'));
        return isActiveBan(ban) ? ban : null;
      } catch {
        return null;
      }
    },

    isBanned(email) {
      return this.getBan(email) != null;
    },

    listActiveBans() {
      const bans = [];
      for (const name of fs.readdirSync(rootDir).filter(file => file.endsWith('.json'))) {
        try {
          const ban = JSON.parse(fs.readFileSync(path.join(rootDir, name), 'utf8'));
          if (isActiveBan(ban)) bans.push(ban);
        } catch {
          /* skip corrupt ban file */
        }
      }
      return bans.sort((a, b) => Number(b.bannedAt) - Number(a.bannedAt));
    },

    purgeExpired() {
      for (const name of fs.readdirSync(rootDir).filter(file => file.endsWith('.json'))) {
        const file = path.join(rootDir, name);
        try {
          const ban = JSON.parse(fs.readFileSync(file, 'utf8'));
          if (!isActiveBan(ban)) fs.unlinkSync(file);
        } catch {
          fs.unlinkSync(file);
        }
      }
    },
  };
}
