import type { Skin } from '../data/skins';
import type { RollResult } from './wheelMath';

export interface PendingUpgrade {
  targetSkin: Skin;
  inputImage: string;
  won: boolean;
  roll: RollResult;
  probability: number;
  inputLabel: string;
  inputTotal: number;
  targetPrice: number;
  timestamp: number;
}

function storageKey(userId: string): string {
  return `blox-upgrader/pending-upgrade/${userId}`;
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
    if (!parsed || typeof parsed.won !== 'boolean' || !parsed.targetSkin?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingUpgrade(userId: string): void {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    /* noop */
  }
}
