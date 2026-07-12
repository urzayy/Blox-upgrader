import type { CaseBattle } from './caseBattles';
import { isBattleFinished } from './caseBattleRuntime';

const LEGACY_BATTLES_KEY = 'blox-upgrader/case-battles-v1';
const BATTLES_KEY = 'blox-upgrader/case-battles-v2';
export const BATTLES_UPDATED_EVENT = 'case-battles-updated';

export function notifyBattlesUpdated(): void {
  window.dispatchEvent(new CustomEvent(BATTLES_UPDATED_EVENT));
}

function dropLegacyBattles(): void {
  try {
    localStorage.removeItem(LEGACY_BATTLES_KEY);
  } catch {
    // ignore
  }
}

export const BATTLE_MAX_CASE_COUNT = 50;

export interface BattleCaseSlot {
  slug: string;
  joker: boolean;
  quantity?: number;
}

export interface LastBattleDraft {
  cases: BattleCaseSlot[];
  savedAt: number;
}

function lastBattleKey(userId: string): string {
  return `blox-upgrader/last-battle-draft/${userId}`;
}

function battleCreatedAt(id: string): number | null {
  const match = id.match(/^battle-(\d+)-/);
  if (!match) return null;
  const timestamp = Number(match[1]);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export const BATTLE_FINISH_GRACE_MS = 5000;

function shouldPersistBattle(battle: CaseBattle): boolean {
  if (!battle?.id || !battle.createdByUserId) return false;
  if (!Array.isArray(battle.players) || battle.players.length === 0) return false;
  if (!Array.isArray(battle.caseSlugs) || battle.caseSlugs.length === 0) return false;
  if (battle.status === 'finished' || isBattleFinished(battle)) {
    const finishedAt = battle.finishedAt ?? battleCreatedAt(battle.id);
    if (finishedAt && Date.now() - finishedAt < BATTLE_FINISH_GRACE_MS) {
      return true;
    }
    return !battle.economySettled;
  }

  const createdAt = battleCreatedAt(battle.id);
  if (
    createdAt &&
    battle.status === 'waiting' &&
    battle.players.length < battle.maxPlayers &&
    Date.now() - createdAt > 2 * 60 * 60 * 1000
  ) {
    return false;
  }

  return battle.status === 'waiting' || battle.status === 'in_progress';
}

export function pruneStoredBattles(battles: CaseBattle[]): CaseBattle[] {
  return battles.filter(shouldPersistBattle);
}

export function clearAllLiveBattles(): void {
  saveLiveBattles([]);
}

export function loadLiveBattles(): CaseBattle[] {
  dropLegacyBattles();

  try {
    const raw = localStorage.getItem(BATTLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CaseBattle[];
    if (!Array.isArray(parsed)) return [];

    const pruned = pruneStoredBattles(parsed);
    if (pruned.length !== parsed.length) {
      saveLiveBattles(pruned);
    }
    return pruned;
  } catch {
    return [];
  }
}

export function saveLiveBattles(battles: CaseBattle[]): void {
  localStorage.setItem(BATTLES_KEY, JSON.stringify(battles));
  notifyBattlesUpdated();
}

export function addLiveBattle(battle: CaseBattle): void {
  const battles = loadLiveBattles();
  saveLiveBattles([battle, ...battles]);
}

export function updateLiveBattle(
  battleId: string,
  updater: (battle: CaseBattle) => CaseBattle,
): CaseBattle | null {
  const battles = loadLiveBattles();
  const index = battles.findIndex(
    battle => battle.id.toLowerCase() === battleId.toLowerCase(),
  );
  if (index === -1) return null;

  const nextBattle = updater(battles[index]);
  battles[index] = nextBattle;
  saveLiveBattles(battles);
  return nextBattle;
}

export function removeLiveBattle(battleId: string): boolean {
  const battles = loadLiveBattles();
  const nextBattles = battles.filter(
    battle => battle.id.toLowerCase() !== battleId.toLowerCase(),
  );
  if (nextBattles.length === battles.length) return false;
  saveLiveBattles(nextBattles);
  return true;
}

export function loadLastBattleDraft(userId: string): LastBattleDraft | null {
  try {
    const raw = localStorage.getItem(lastBattleKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastBattleDraft;
    if (!parsed?.cases?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLastBattleDraft(userId: string, draft: LastBattleDraft): void {
  localStorage.setItem(lastBattleKey(userId), JSON.stringify(draft));
}
