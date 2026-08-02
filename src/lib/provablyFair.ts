import type { Skin } from '../data/skins';
import type { FreeCaseLootItem } from './freeCaseLoot';
import {
  buildLootRollRangesFromEntries,
  pickSkinIdFromRoll,
  type LootRollRange,
} from './lootRollRange';
import { ROLL_MAX, winRollMax, type RollResult } from './wheelMath';

export type FairGameType = 'case' | 'free-case' | 'upgrade' | 'battle' | 'consolation';

export interface FairRollProof {
  clientSeed: string;
  serverSeed: string;
  secretSalt: string;
  nonce: number;
  serverSeedHash: string;
  roll: number;
  rollFloat: number;
  hash: string;
  gameType: FairGameType;
  gameMeta?: {
    caseSlug?: string;
    probability?: number;
    winMax?: number;
    skinId?: string;
    skinName?: string;
    won?: boolean;
  };
  createdAt: number;
}

export interface FairSeedHistoryEntry {
  serverSeed: string;
  secretSalt: string;
  serverSeedHash: string;
  nonceAtReveal: number;
  revealedAt: number;
}

export interface ProvablyFairState {
  clientSeed: string;
  serverSeed: string;
  secretSalt: string;
  nonce: number;
  seedHistory: FairSeedHistoryEntry[];
  clientSeedHistory: string[];
}

const STORAGE_PREFIX = 'blox-upgrader/provably-fair/';
const SEED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateFairSeed(length = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => SEED_CHARS[byte % SEED_CHARS.length]).join('');
}

async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

export async function computePublicHash(serverSeed: string, secretSalt: string): Promise<string> {
  return sha256(`${serverSeed}:${secretSalt}`);
}

async function computeRollHash(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  gameType: FairGameType,
): Promise<string> {
  return sha256(`${serverSeed}:${clientSeed}:${nonce}:${gameType}`);
}

export function hashToRollValues(hash: string): { roll: number; rollFloat: number } {
  const roll = (parseInt(hash.slice(0, 8), 16) % ROLL_MAX) + 1;
  const rollFloat = (parseInt(hash.slice(8, 16), 16) / 0xffffffff) * 100;
  return { roll, rollFloat };
}

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function defaultState(): ProvablyFairState {
  return {
    clientSeed: generateFairSeed(8),
    serverSeed: generateFairSeed(32),
    secretSalt: generateFairSeed(16),
    nonce: 0,
    seedHistory: [],
    clientSeedHistory: [],
  };
}

function isFairState(value: unknown): value is ProvablyFairState {
  if (!value || typeof value !== 'object') return false;
  const state = value as ProvablyFairState;
  return (
    typeof state.clientSeed === 'string'
    && typeof state.serverSeed === 'string'
    && typeof state.secretSalt === 'string'
    && typeof state.nonce === 'number'
    && Array.isArray(state.seedHistory)
    && Array.isArray(state.clientSeedHistory)
  );
}

export function loadFairState(userId: string): ProvablyFairState {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) {
      const initial = defaultState();
      saveFairState(userId, initial);
      return initial;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isFairState(parsed)) {
      const initial = defaultState();
      saveFairState(userId, initial);
      return initial;
    }
    return parsed;
  } catch {
    const initial = defaultState();
    saveFairState(userId, initial);
    return initial;
  }
}

export function saveFairState(userId: string, state: ProvablyFairState): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {
    /* storage blocked */
  }
}

export async function getFairPublicSnapshot(userId: string): Promise<{
  clientSeed: string;
  serverSeedMasked: string;
  secretSaltMasked: string;
  publicHash: string;
  nonce: number;
  seedHistory: FairSeedHistoryEntry[];
  clientSeedHistory: string[];
}> {
  const state = loadFairState(userId);
  const publicHash = await computePublicHash(state.serverSeed, state.secretSalt);
  return {
    clientSeed: state.clientSeed,
    serverSeedMasked: '*'.repeat(24),
    secretSaltMasked: '*'.repeat(16),
    publicHash,
    nonce: state.nonce,
    seedHistory: state.seedHistory,
    clientSeedHistory: state.clientSeedHistory,
  };
}

export async function executeFairRoll(
  userId: string,
  gameType: FairGameType,
  gameMeta?: FairRollProof['gameMeta'],
): Promise<FairRollProof> {
  const state = loadFairState(userId);
  const nonce = state.nonce;
  const serverSeedHash = await computePublicHash(state.serverSeed, state.secretSalt);
  const hash = await computeRollHash(state.serverSeed, state.clientSeed, nonce, gameType);
  const { roll, rollFloat } = hashToRollValues(hash);

  const proof: FairRollProof = {
    clientSeed: state.clientSeed,
    serverSeed: state.serverSeed,
    secretSalt: state.secretSalt,
    nonce,
    serverSeedHash,
    roll,
    rollFloat,
    hash,
    gameType,
    gameMeta,
    createdAt: Date.now(),
  };

  saveFairState(userId, { ...state, nonce: nonce + 1 });
  return proof;
}

export function pickSkinFromFairRoll(
  loot: FreeCaseLootItem[],
  roll: number,
  entryOrder: string[],
): Skin | null {
  const lootById = new Map(loot.map(item => [item.skin.id, item]));
  const entries = entryOrder
    .map(skinId => {
      const item = lootById.get(skinId);
      return item ? { skinId, chance: item.chance } : null;
    })
    .filter((entry): entry is { skinId: string; chance: number } => entry !== null);

  const ranges = buildLootRollRangesFromEntries(entries);
  const skinId = pickSkinIdFromRoll(roll, entryOrder, ranges);
  return skinId ? lootById.get(skinId)?.skin ?? null : null;
}

export function getLootRollRangesForEntries(
  loot: FreeCaseLootItem[],
  entryOrder: string[],
): Map<string, LootRollRange> {
  const lootById = new Map(loot.map(item => [item.skin.id, item]));
  const entries = entryOrder
    .map(skinId => {
      const item = lootById.get(skinId);
      return item ? { skinId, chance: item.chance } : null;
    })
    .filter((entry): entry is { skinId: string; chance: number } => entry !== null);

  return buildLootRollRangesFromEntries(entries);
}

export function resolveRollFromProof(probability: number, proof: FairRollProof): RollResult {
  const winMax = winRollMax(probability);
  return {
    roll: proof.roll,
    winMax,
    won: proof.roll <= winMax,
  };
}

export async function verifyFairRollProof(proof: FairRollProof): Promise<{
  valid: boolean;
  hashValid: boolean;
  seedHashValid: boolean;
  rollValid: boolean;
  message: string;
}> {
  const expectedHash = await computeRollHash(
    proof.serverSeed,
    proof.clientSeed,
    proof.nonce,
    proof.gameType,
  );
  const expectedSeedHash = await computePublicHash(proof.serverSeed, proof.secretSalt);
  const { roll, rollFloat } = hashToRollValues(expectedHash);

  const hashValid = expectedHash === proof.hash;
  const seedHashValid = expectedSeedHash === proof.serverSeedHash;
  const rollValid = roll === proof.roll && Math.abs(rollFloat - proof.rollFloat) < 0.0001;
  const valid = hashValid && seedHashValid && rollValid;

  return {
    valid,
    hashValid,
    seedHashValid,
    rollValid,
    message: valid
      ? 'This drop is provably fair and verified.'
      : 'Verification failed — roll data does not match the seeds.',
  };
}

export async function updateClientSeed(userId: string, nextSeed: string): Promise<string | null> {
  const trimmed = nextSeed.trim();
  if (!trimmed || trimmed.length < 4 || trimmed.length > 32) {
    return 'Client seed must be between 4 and 32 characters.';
  }

  const state = loadFairState(userId);
  const history = state.clientSeedHistory.includes(state.clientSeed)
    ? state.clientSeedHistory
    : [state.clientSeed, ...state.clientSeedHistory].slice(0, 20);

  saveFairState(userId, {
    ...state,
    clientSeed: trimmed,
    clientSeedHistory: history,
  });
  return null;
}

export async function revealAndRotateServerSeed(userId: string): Promise<FairSeedHistoryEntry | null> {
  const state = loadFairState(userId);
  const serverSeedHash = await computePublicHash(state.serverSeed, state.secretSalt);
  const revealed: FairSeedHistoryEntry = {
    serverSeed: state.serverSeed,
    secretSalt: state.secretSalt,
    serverSeedHash,
    nonceAtReveal: state.nonce,
    revealedAt: Date.now(),
  };

  saveFairState(userId, {
    ...state,
    serverSeed: generateFairSeed(32),
    secretSalt: generateFairSeed(16),
    seedHistory: [revealed, ...state.seedHistory].slice(0, 20),
  });

  return revealed;
}

export function formatFairRoll(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}
