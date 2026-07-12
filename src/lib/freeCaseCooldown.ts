import { slugForTier, type FreeCaseTier } from './freeCaseTiers';
import { canPlayerOpenFreeCase } from './freeCaseUnlock';

export const FREE_CASE_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const STORAGE_VERSION = 1;
const UPDATED_EVENT = 'free-case-cooldown-updated';

type CooldownMap = Record<string, number>;

function storageKey(userId: string): string {
  return `bloxupgrader_free_case_cd_v${STORAGE_VERSION}_${userId}`;
}

function loadMap(userId: string | null | undefined): CooldownMap {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CooldownMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveMap(userId: string, map: CooldownMap): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(map));
  } catch {
    /* noop */
  }
}

export function getLastOpenedAt(userId: string | null | undefined, slug: string): number | null {
  const at = loadMap(userId)[slug.toLowerCase()];
  return typeof at === 'number' && Number.isFinite(at) ? at : null;
}

export function getCooldownRemainingMs(
  userId: string | null | undefined,
  slug: string,
  now = Date.now(),
): number {
  const lastOpened = getLastOpenedAt(userId, slug);
  if (!lastOpened) return 0;
  return Math.max(0, FREE_CASE_COOLDOWN_MS - (now - lastOpened));
}

export function canOpenFreeCase(userId: string | null | undefined, slug: string, now = Date.now()): boolean {
  if (!canPlayerOpenFreeCase(userId, slug)) return false;
  return getCooldownRemainingMs(userId, slug, now) === 0;
}

export function recordFreeCaseOpen(userId: string, slug: string, openedAt = Date.now()): void {
  if (!canPlayerOpenFreeCase(userId, slug)) return;

  const map = loadMap(userId);
  map[slug.toLowerCase()] = openedAt;
  saveMap(userId, map);
  window.dispatchEvent(new CustomEvent(UPDATED_EVENT, {
    detail: { userId, slug: slug.toLowerCase(), openedAt },
  }));
}

export function clearFreeCaseCooldowns(userId: string): void {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    /* noop */
  }
}

export function formatCooldown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function tierSlug(tier: FreeCaseTier): string {
  return slugForTier(tier);
}

export function subscribeFreeCaseCooldowns(
  userId: string | null | undefined,
  onUpdate: () => void,
): () => void {
  const onEvent = (event: Event) => {
    const detail = (event as CustomEvent<{ userId?: string }>).detail;
    if (!userId || detail?.userId === userId) onUpdate();
  };

  window.addEventListener(UPDATED_EVENT, onEvent);
  window.addEventListener('storage', onUpdate);
  return () => {
    window.removeEventListener(UPDATED_EVENT, onEvent);
    window.removeEventListener('storage', onUpdate);
  };
}
