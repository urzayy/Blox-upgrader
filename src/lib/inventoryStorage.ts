import { type Skin } from '../data/skins';
import { findAccountByEmail } from './auth';

const STORAGE_VERSION = 2;

function defaultInventory(_userId: string | null): Skin[] {
  return [];
}

function inventoryKey(userId: string | null): string {
  return userId
    ? `blox-upgrader/inventory/${userId}`
    : 'blox-upgrader/inventory/guest';
}

export function getInventoryStorageKey(userId: string | null = null): string {
  return inventoryKey(userId);
}

function versionKey(userId: string | null): string {
  return userId
    ? `blox-upgrader/inventory-version/${userId}`
    : 'blox-upgrader/inventory-version/guest';
}

function isSkin(value: unknown): value is Skin {
  if (!value || typeof value !== 'object') return false;
  const s = value as Skin;
  return (
    typeof s.id === 'string'
    && typeof s.name === 'string'
    && typeof s.weapon === 'string'
    && typeof s.rarity === 'string'
    && typeof s.wear === 'string'
    && typeof s.price === 'number'
    && typeof s.image === 'string'
    && (s.obtainedAt === undefined || typeof s.obtainedAt === 'number')
  );
}

/** Legacy saves could reuse catalog ids; React keys must stay unique. */
function ensureUniqueInventoryIds(skins: Skin[]): Skin[] {
  const seen = new Set<string>();
  return skins.map(skin => {
    if (!seen.has(skin.id)) {
      seen.add(skin.id);
      return skin;
    }
    const unique: Skin = {
      ...skin,
      id: `inv_fix_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
    seen.add(unique.id);
    return unique;
  });
}

export function loadInventory(userId: string | null = null): Skin[] {
  const key = inventoryKey(userId);
  const vKey = versionKey(userId);

  try {
    const version = localStorage.getItem(vKey);
    if (version !== String(STORAGE_VERSION)) {
      localStorage.setItem(vKey, String(STORAGE_VERSION));
      localStorage.removeItem(key);
      return defaultInventory(userId);
    }

    const raw = localStorage.getItem(key);
    if (!raw) return defaultInventory(userId);

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isSkin)) return defaultInventory(userId);

    return ensureUniqueInventoryIds(parsed);
  } catch {
    return defaultInventory(userId);
  }
}

export function saveInventory(inventory: Skin[], userId: string | null = null): void {
  try {
    localStorage.setItem(inventoryKey(userId), JSON.stringify(inventory));
  } catch {
    /* storage full or blocked */
  }
}

const appendChains = new Map<string, Promise<void>>();

/** Serializes inventory appends per user to avoid lost skins on rapid multi-case reveals. */
export function appendSkinToInventory(userId: string, skin: Skin): Promise<void> {
  return appendSkinsToInventory(userId, [skin]);
}

export function appendSkinsToInventory(userId: string, skins: Skin[]): Promise<void> {
  if (!skins.length) return Promise.resolve();

  const previous = appendChains.get(userId) ?? Promise.resolve();
  const next = previous
    .then(() => {
      const inventory = loadInventory(userId);
      saveInventory([...inventory, ...skins], userId);
    })
    .catch(() => {
      /* keep chain alive after failures */
    });
  appendChains.set(userId, next);
  return next;
}

export function clearSavedInventory(userId: string | null = null): void {
  try {
    localStorage.removeItem(inventoryKey(userId));
    localStorage.removeItem(versionKey(userId));
  } catch {
    /* noop */
  }
}

/** Wipes a user's saved inventory to empty (by email). */
export function clearInventoryForEmail(email: string): boolean {
  const account = findAccountByEmail(email);
  if (!account) return false;
  const vKey = versionKey(account.id);
  const key = inventoryKey(account.id);
  localStorage.setItem(vKey, String(STORAGE_VERSION));
  localStorage.setItem(key, JSON.stringify([]));
  return true;
}

export function clearInventoryForUserId(userId: string): void {
  const vKey = versionKey(userId);
  const key = inventoryKey(userId);
  localStorage.setItem(vKey, String(STORAGE_VERSION));
  localStorage.setItem(key, JSON.stringify([]));
}
