import type { Skin } from '../data/skins';

export type ArchiveReason = 'upgraded' | 'sold' | 'withdrawn' | 'lost';

export interface ArchivedSkin extends Skin {
  archivedAt: number;
  reason: ArchiveReason;
}

const KEY_PREFIX = 'blox-upgrader/inventory-archive/';

function storageKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

function isArchivedSkin(value: unknown): value is ArchivedSkin {
  if (!value || typeof value !== 'object') return false;
  const s = value as ArchivedSkin;
  return (
    typeof s.id === 'string'
    && typeof s.name === 'string'
    && typeof s.archivedAt === 'number'
    && typeof s.reason === 'string'
  );
}

export function archiveReasonLabel(reason: ArchiveReason): string {
  if (reason === 'upgraded' || reason === 'lost') return 'Upgraded';
  if (reason === 'sold') return 'Sold';
  return 'Withdrawn';
}

export function loadArchivedInventory(userId: string | null): ArchivedSkin[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isArchivedSkin).sort((a, b) => b.archivedAt - a.archivedAt);
  } catch {
    return [];
  }
}

export function archiveInventorySkins(
  userId: string | null,
  skins: Skin[],
  reason: ArchiveReason,
): void {
  if (!userId || skins.length === 0) return;
  const existing = loadArchivedInventory(userId);
  const seen = new Set(existing.map(s => s.id));
  const now = Date.now();
  const next = [
    ...skins
      .filter(s => !seen.has(s.id))
      .map(s => ({ ...s, archivedAt: now, reason })),
    ...existing,
  ].slice(0, 300);
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(next));
  } catch {
    /* storage full */
  }
}
