import type { FairRollProof } from './provablyFair';

const STORAGE_PREFIX = 'blox-upgrader/fair-proofs/';

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function isFairProof(value: unknown): value is FairRollProof {
  if (!value || typeof value !== 'object') return false;
  const proof = value as FairRollProof;
  return (
    typeof proof.clientSeed === 'string'
    && typeof proof.serverSeed === 'string'
    && typeof proof.secretSalt === 'string'
    && typeof proof.nonce === 'number'
    && typeof proof.serverSeedHash === 'string'
    && typeof proof.roll === 'number'
    && typeof proof.rollFloat === 'number'
    && typeof proof.hash === 'string'
    && typeof proof.gameType === 'string'
    && typeof proof.createdAt === 'number'
  );
}

function loadProofMap(userId: string): Record<string, FairRollProof> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const entries = Object.entries(parsed as Record<string, unknown>);
    const map: Record<string, FairRollProof> = {};
    for (const [skinId, proof] of entries) {
      if (isFairProof(proof)) map[skinId] = proof;
    }
    return map;
  } catch {
    return {};
  }
}

function saveProofMap(userId: string, map: Record<string, FairRollProof>): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(map));
  } catch {
    /* storage blocked */
  }
}

export function saveFairProof(userId: string, skinId: string, proof: FairRollProof): void {
  const map = loadProofMap(userId);
  map[skinId] = proof;
  saveProofMap(userId, map);
}

export function getFairProof(userId: string, skinId: string): FairRollProof | null {
  return loadProofMap(userId)[skinId] ?? null;
}

export function getAllFairProofs(userId: string): FairRollProof[] {
  return Object.values(loadProofMap(userId)).sort((a, b) => b.createdAt - a.createdAt);
}
