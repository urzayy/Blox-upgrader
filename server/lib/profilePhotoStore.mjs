import fs from 'node:fs';
import path from 'node:path';

const MAX_BYTES = 900_000;

function normalizeUserId(userId) {
  return String(userId).replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function createProfilePhotoStore(rootDir) {
  if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

  function filePath(userId) {
    return path.join(rootDir, `${normalizeUserId(userId)}.json`);
  }

  return {
    type: 'file',
    getPhoto(userId) {
      const file = filePath(userId);
      if (!fs.existsSync(file)) return null;
      try {
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (!parsed?.dataUrl || typeof parsed.dataUrl !== 'string') return null;
        return {
          userId: String(userId),
          dataUrl: parsed.dataUrl,
          updatedAt: Number(parsed.updatedAt ?? 0),
        };
      } catch {
        return null;
      }
    },
    savePhoto({ userId, email, dataUrl }) {
      if (!userId || !dataUrl || typeof dataUrl !== 'string') {
        return { ok: false, error: 'invalid_request' };
      }
      if (!dataUrl.startsWith('data:image/jpeg;base64,') && !dataUrl.startsWith('data:image/png;base64,')) {
        return { ok: false, error: 'invalid_format' };
      }
      const bytes = Buffer.byteLength(dataUrl, 'utf8');
      if (bytes > MAX_BYTES) {
        return { ok: false, error: 'too_large' };
      }
      const payload = {
        userId: String(userId),
        email: String(email ?? '').trim().toLowerCase(),
        dataUrl,
        updatedAt: Date.now(),
      };
      fs.writeFileSync(filePath(userId), JSON.stringify(payload), 'utf8');
      return { ok: true, photo: { userId: payload.userId, dataUrl: payload.dataUrl, updatedAt: payload.updatedAt } };
    },
  };
}
