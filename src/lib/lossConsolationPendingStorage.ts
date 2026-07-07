import type { Skin } from '../data/skins';
import type { RollResult } from './wheelMath';

export interface PendingLossConsolation {
  grantedSkin: Skin;
  lostValue: number;
  inputLabel: string;
  turbo: boolean;
  percent: number;
  rewardSkin: Skin;
  pending: {
    won: boolean;
    roll: RollResult;
    inputLabel: string;
    inputImage: string;
    inputTotal: number;
    targetSkin: Skin;
    probability: number;
  };
  uiSettled: boolean;
  timestamp: number;
}

function storageKey(userId: string): string {
  return `blox-upgrader/pending-loss-consolation/${userId}`;
}

export function savePendingLossConsolation(userId: string, pending: PendingLossConsolation): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(pending));
  } catch {
    /* storage blocked */
  }
}

export function loadPendingLossConsolation(userId: string): PendingLossConsolation | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingLossConsolation;
    if (!parsed?.grantedSkin?.id || !parsed.rewardSkin?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingLossConsolation(userId: string): void {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    /* noop */
  }
}

export function getUnsettledConsolationSkinId(userId: string | null): string | null {
  if (!userId) return null;
  const pending = loadPendingLossConsolation(userId);
  if (!pending || pending.uiSettled) return null;
  return pending.grantedSkin.id;
}
