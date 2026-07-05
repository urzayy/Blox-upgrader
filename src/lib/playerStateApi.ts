import type { Skin } from '../data/skins';

export interface PlayerStateSnapshot {
  userId: string | null;
  email: string;
  balance: number;
  inventory: Skin[];
  updatedAt: number;
}

async function postJson(url: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncPlayerState(payload: {
  userId: string;
  email: string;
  balance: number;
  inventory: Skin[];
}): Promise<boolean> {
  return postJson('/api/player-state/sync', payload);
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
