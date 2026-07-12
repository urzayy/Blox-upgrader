import type { CaseBattle } from './caseBattles';
import { isBattleFinished } from './caseBattleRuntime';
import {
  fetchCaseBattleFromServer,
  fetchLiveBattlesFromServer,
  removeCaseBattleOnServer,
  upsertCaseBattleOnServer,
} from './caseBattlesApi';

const LEGACY_BATTLES_KEY = 'blox-upgrader/case-battles-v1';
const BATTLES_KEY = 'blox-upgrader/case-battles-v2';
export const BATTLES_UPDATED_EVENT = 'case-battles-updated';

export function notifyBattlesUpdated(): void {
  window.dispatchEvent(new CustomEvent(BATTLES_UPDATED_EVENT));
}

let serverBattleCache: CaseBattle[] | null = null;
let serverSyncStop: (() => void) | null = null;

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

function areAllHumansSettled(battle: CaseBattle): boolean {
  const humans = battle.players.filter(player => !player.isBot).map(player => player.id);
  if (humans.length === 0) return true;
  const settled = new Set(battle.settledUserIds ?? []);
  return humans.every(id => settled.has(id));
}

function shouldPersistBattle(battle: CaseBattle): boolean {
  if (!battle?.id || !battle.createdByUserId) return false;
  if (!Array.isArray(battle.players) || battle.players.length === 0) return false;
  if (!Array.isArray(battle.caseSlugs) || battle.caseSlugs.length === 0) return false;
  if (battle.status === 'finished' || isBattleFinished(battle)) {
    const finishedAt = battle.finishedAt ?? battleCreatedAt(battle.id);
    if (finishedAt && Date.now() - finishedAt < BATTLE_FINISH_GRACE_MS) {
      return true;
    }
    return !areAllHumansSettled(battle);
  }

  const createdAt = battleCreatedAt(battle.id);
  if (
    createdAt
    && battle.status === 'waiting'
    && battle.players.length < battle.maxPlayers
    && Date.now() - createdAt > 2 * 60 * 60 * 1000
  ) {
    return false;
  }

  return battle.status === 'waiting' || battle.status === 'in_progress';
}

export function pruneStoredBattles(battles: CaseBattle[]): CaseBattle[] {
  return battles.filter(shouldPersistBattle);
}

function writeLocalBattles(battles: CaseBattle[]): void {
  const pruned = pruneStoredBattles(battles);
  try {
    localStorage.setItem(BATTLES_KEY, JSON.stringify(pruned));
  } catch {
    // ignore
  }
  serverBattleCache = pruned;
}

function mergeBattleIntoCache(battle: CaseBattle): void {
  const current = serverBattleCache ?? loadLocalBattlesOnly();
  const normalized = battle.id.toLowerCase();
  const index = current.findIndex(entry => entry.id.toLowerCase() === normalized);
  const next = index === -1
    ? [battle, ...current]
    : current.map((entry, i) => (i === index ? battle : entry));
  writeLocalBattles(next);
  notifyBattlesUpdated();
}

function loadLocalBattlesOnly(): CaseBattle[] {
  dropLegacyBattles();
  try {
    const raw = localStorage.getItem(BATTLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CaseBattle[];
    if (!Array.isArray(parsed)) return [];
    return pruneStoredBattles(parsed);
  } catch {
    return [];
  }
}

export async function refreshBattlesFromServer(): Promise<CaseBattle[]> {
  const remote = await fetchLiveBattlesFromServer();
  if (remote) {
    writeLocalBattles(remote);
    notifyBattlesUpdated();
    return remote;
  }
  return serverBattleCache ?? loadLocalBattlesOnly();
}

export async function hydrateBattleFromServer(battleId: string): Promise<CaseBattle | null> {
  const remote = await fetchCaseBattleFromServer(battleId);
  if (!remote) return null;
  mergeBattleIntoCache(remote);
  return remote;
}

export function startCaseBattlesServerSync(pollMs = 1500): () => void {
  if (serverSyncStop) {
    serverSyncStop();
    serverSyncStop = null;
  }

  const sync = () => {
    void refreshBattlesFromServer();
  };

  sync();
  const intervalId = window.setInterval(sync, pollMs);
  serverSyncStop = () => window.clearInterval(intervalId);
  return serverSyncStop;
}

export function clearAllLiveBattles(): void {
  writeLocalBattles([]);
  notifyBattlesUpdated();
}

export function loadLiveBattles(): CaseBattle[] {
  if (serverBattleCache) return serverBattleCache;
  const local = loadLocalBattlesOnly();
  serverBattleCache = local;
  return local;
}

export function saveLiveBattles(battles: CaseBattle[]): void {
  writeLocalBattles(battles);
  notifyBattlesUpdated();
  for (const battle of battles) {
    void upsertCaseBattleOnServer(battle);
  }
}

export function addLiveBattle(battle: CaseBattle): void {
  mergeBattleIntoCache(battle);
  void upsertCaseBattleOnServer(battle);
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
  mergeBattleIntoCache(nextBattle);
  void upsertCaseBattleOnServer(nextBattle);
  return nextBattle;
}

export function removeLiveBattle(battleId: string): boolean {
  const battles = loadLiveBattles();
  const nextBattles = battles.filter(
    battle => battle.id.toLowerCase() !== battleId.toLowerCase(),
  );
  if (nextBattles.length === battles.length) return false;
  writeLocalBattles(nextBattles);
  notifyBattlesUpdated();
  void removeCaseBattleOnServer(battleId);
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
