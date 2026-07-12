const STORAGE_PREFIX = 'blox-upgrader/announcement-dismissed';

function storageKey(userKey: string): string {
  return `${STORAGE_PREFIX}/${userKey}`;
}

function readDismissedIds(userKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(userKey));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
  } catch {
    return new Set();
  }
}

function writeDismissedIds(userKey: string, ids: Set<string>): void {
  localStorage.setItem(storageKey(userKey), JSON.stringify([...ids]));
}

export function isAnnouncementDismissed(userKey: string, announcementId: string): boolean {
  return readDismissedIds(userKey).has(announcementId);
}

export function dismissAnnouncement(userKey: string, announcementId: string): void {
  const ids = readDismissedIds(userKey);
  ids.add(announcementId);
  writeDismissedIds(userKey, ids);
}

export function announcementUserKey(userId: string | null | undefined): string {
  const trimmed = String(userId ?? '').trim();
  return trimmed || 'guest';
}
