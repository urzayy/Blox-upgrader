import type { Skin } from '../data/skins';

export interface PlayerStateSnapshot {
  userId: string | null;
  email: string;
  balance: number;
  inventory: Skin[];
  updatedAt: number;
}

export interface PlayerStateSyncResult {
  ok: boolean;
  forceReset?: boolean;
  resetAt?: number;
  state?: PlayerStateSnapshot;
}

export async function syncPlayerState(payload: {
  userId: string;
  email: string;
  balance: number;
  inventory: Skin[];
  resetAck?: number;
}): Promise<PlayerStateSyncResult> {
  try {
    const res = await fetch('/api/player-state/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({})) as PlayerStateSyncResult & { message?: string };
    if (!res.ok) {
      return { ok: false };
    }
    return {
      ok: true,
      forceReset: data.forceReset,
      resetAt: data.resetAt,
      state: data.state,
    };
  } catch {
    return { ok: false };
  }
}

export async function fetchPlayerStateByEmail(
  adminEmail: string,
  email: string,
): Promise<PlayerStateSnapshot | null> {
  const res = await fetch(
    `/api/admin/player-state?adminEmail=${encodeURIComponent(adminEmail)}&email=${encodeURIComponent(email.trim().toLowerCase())}`,
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(data.message ?? 'Could not load player state');
  }
  const data = await res.json() as { state: PlayerStateSnapshot | null };
  return data.state;
}
