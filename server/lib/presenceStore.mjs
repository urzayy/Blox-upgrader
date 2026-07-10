const PRESENCE_TTL_MS = 45_000;
const sessions = new Map();

function pruneStale(now = Date.now()) {
  const cutoff = now - PRESENCE_TTL_MS;
  for (const [key, seen] of sessions) {
    if (seen < cutoff) sessions.delete(key);
  }
}

export function touchPresence(key) {
  const normalized = String(key ?? '').trim();
  if (!normalized) return;
  sessions.set(normalized, Date.now());
  pruneStale();
}

export function getActivePresenceCount() {
  pruneStale();
  return sessions.size;
}

export function registerPresenceHeartbeat({ userId, visitorId }) {
  const visitor = String(visitorId ?? '').trim();
  if (!visitor) return { ok: false };

  const uid = String(userId ?? '').trim();
  touchPresence(uid || `guest:${visitor}`);
  return { ok: true, count: getActivePresenceCount() };
}
