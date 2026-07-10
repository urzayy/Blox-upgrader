import type { Skin } from '../data/skins';
import { inventoryTotal } from './inventory';
import { loadBalance, saveBalance } from './balanceStorage';
import { loadInventory, saveInventory } from './inventoryStorage';
import type { PlayerStateSnapshot } from './playerStateApi';

const UPDATED_AT_KEY_PREFIX = 'blox-upgrader/player-state-updated-at/';

function updatedAtKey(userId: string): string {
  return `${UPDATED_AT_KEY_PREFIX}${userId}`;
}

export function getLocalPlayerStateUpdatedAt(userId: string): number {
  try {
    const raw = localStorage.getItem(updatedAtKey(userId));
    const value = Number(raw ?? 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function setLocalPlayerStateUpdatedAt(userId: string, updatedAt: number): void {
  try {
    localStorage.setItem(updatedAtKey(userId), String(Math.max(0, Math.floor(updatedAt))));
  } catch {
    /* noop */
  }
}

export function localPlayerHasProgress(userId: string): boolean {
  const balance = loadBalance(userId);
  const inventory = loadInventory(userId);
  return balance > 0 || inventory.length > 0;
}

export function shouldHydrateFromServer(
  userId: string,
  serverState: PlayerStateSnapshot | null | undefined,
): boolean {
  if (!serverState) return false;
  const serverHasData = serverState.balance > 0 || serverState.inventory.length > 0;
  if (!serverHasData) return false;

  const localUpdatedAt = getLocalPlayerStateUpdatedAt(userId);
  const localHasData = localPlayerHasProgress(userId);

  if (!localHasData) return true;
  if (serverState.updatedAt > localUpdatedAt) return true;

  const localValue = loadBalance(userId) + inventoryTotal(loadInventory(userId));
  const serverValue = serverState.balance + inventoryTotal(serverState.inventory);
  return serverValue > localValue;
}

export function applyPlayerStateSnapshot(
  userId: string,
  state: PlayerStateSnapshot,
): { balance: number; inventory: Skin[] } {
  saveBalance(state.balance, userId);
  saveInventory(state.inventory, userId);
  setLocalPlayerStateUpdatedAt(userId, state.updatedAt || Date.now());
  return { balance: state.balance, inventory: state.inventory };
}

export function touchLocalPlayerStateUpdatedAt(userId: string): void {
  setLocalPlayerStateUpdatedAt(userId, Date.now());
}
