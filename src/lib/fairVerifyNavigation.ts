import { navigateApp } from './appRoute';
import type { FairRollProof } from './provablyFair';
import { scrollToPageTop } from './scrollToSection';

const PENDING_VERIFY_KEY = 'blox-upgrader/pending-fair-verify';

function isFairRollProof(value: unknown): value is FairRollProof {
  if (!value || typeof value !== 'object') return false;
  const proof = value as FairRollProof;
  return (
    typeof proof.clientSeed === 'string'
    && typeof proof.serverSeed === 'string'
    && typeof proof.hash === 'string'
    && typeof proof.roll === 'number'
  );
}

export function queueFairVerifyProof(proof: FairRollProof): void {
  try {
    sessionStorage.setItem(PENDING_VERIFY_KEY, JSON.stringify(proof));
  } catch {
    /* storage blocked */
  }
}

export function consumePendingFairVerifyProof(): FairRollProof | null {
  try {
    const raw = sessionStorage.getItem(PENDING_VERIFY_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_VERIFY_KEY);
    const parsed: unknown = JSON.parse(raw);
    return isFairRollProof(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function navigateToFairVerify(proof: FairRollProof): void {
  queueFairVerifyProof(proof);
  navigateApp('provably-fair');
  window.setTimeout(() => scrollToPageTop(), 0);
}

export function serializeFairProof(proof: FairRollProof): string {
  return JSON.stringify(proof, null, 2);
}
