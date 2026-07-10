import type { Skin } from '../data/skins';
import type { RollResult } from './wheelMath';

export interface PendingUpgrade {
  inputSkinIds: string[];
  targetSkin: Skin;
  inputImage: string;
  inputLabel: string;
  inputTotal: number;
  targetPrice: number;
  probability: number;
  roll?: RollResult;
  won?: boolean;
  timestamp: number;
}

function storageKey(userId: string): string {
  return `blox-upgrader/pending-upgrade/${userId}`;
}

export function getPendingUpgradeStorageKey(userId: string): string {
  return storageKey(userId);
}

export function getPendingUpgradeStakedSkinIds(userId: string | null): ReadonlySet<string> {
  if (!userId) return new Set();
  const pending = loadPendingUpgrade(userId);
  if (!pending?.inputSkinIds?.length) return new Set();
  return new Set(pending.inputSkinIds);
}

export function savePendingUpgrade(userId: string, pending: PendingUpgrade): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(pending));
  } catch {
    /* storage blocked */
  }
}

export function loadPendingUpgrade(userId: string): PendingUpgrade | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingUpgrade;
    if (!parsed || !parsed.targetSkin?.id) return null;
    if (!Array.isArray(parsed.inputSkinIds)) {
      parsed.inputSkinIds = [];
    }
    return parsed;
  } catch {
    return null;
  }
}

export function lockPendingUpgradeRoll(userId: string, roll: RollResult): void {
  const pending = loadPendingUpgrade(userId);
  if (!pending) return;
  savePendingUpgrade(userId, {
    ...pending,
    roll,
    won: roll.won,
  });
}

export function clearPendingUpgrade(userId: string): void {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    /* noop */
  }
}
