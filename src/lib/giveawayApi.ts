import type { Skin } from '../data/skins';
import type { GiveawayPeriod } from './giveaways';

export type GiveawayStatus = 'active' | 'closed';

export interface GiveawayRuntimeSlot {
  period: GiveawayPeriod;
  status: GiveawayStatus;
  skin: Skin | null;
  depositRequirement: number;
  startedAt: number | null;
  endsAt: number | null;
  participants: number;
  totalEntries?: number;
  openedBy: string | null;
  closedAt: number | null;
}

export interface GiveawayParticipant {
  userId: string;
  email: string;
  nickname: string;
  avatarId: 1 | 2 | 3;
  totalDeposited: number;
  entries: number;
  joinedAt: number;
}

export interface GiveawayDetailResponse {
  giveaway: GiveawayRuntimeSlot;
  participants: GiveawayParticipant[];
  totalEntries: number;
  me: GiveawayParticipant | null;
  myChance: number;
  coinsPerEntry: number;
}

export interface GiveawaysStateResponse {
  giveaways: Record<GiveawayPeriod, GiveawayRuntimeSlot>;
}

export async function fetchGiveawaysState(): Promise<GiveawaysStateResponse | null> {
  try {
    const res = await fetch('/api/giveaways');
    if (!res.ok) return null;
    return await res.json() as GiveawaysStateResponse;
  } catch {
    return null;
  }
}

export async function adminOpenGiveaway(payload: {
  adminEmail: string;
  period: GiveawayPeriod;
  skin: Skin;
  depositRequirement: number;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/giveaways/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({})) as { error?: string };
    if (!res.ok) return { ok: false, error: data.error ?? 'No se pudo abrir el sorteo.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error de red.' };
  }
}

export async function adminCloseGiveaway(payload: {
  adminEmail: string;
  period: GiveawayPeriod;
  pickWinner?: boolean;
}): Promise<{ ok: boolean; error?: string; winner?: { nickname: string; email: string } }> {
  try {
    const res = await fetch('/api/admin/giveaways/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({})) as {
      error?: string;
      winner?: { nickname?: string; email?: string };
    };
    if (!res.ok) return { ok: false, error: data.error ?? 'No se pudo cerrar el sorteo.' };
    return {
      ok: true,
      winner: data.winner
        ? { nickname: data.winner.nickname ?? '', email: data.winner.email ?? '' }
        : undefined,
    };
  } catch {
    return { ok: false, error: 'Error de red.' };
  }
}

export interface GiveawayWinnerRecord {
  id: string;
  period: GiveawayPeriod;
  skin: Skin;
  winnerUserId: string;
  winnerEmail: string;
  winnerNickname: string;
  wonAt: number;
}

export interface GiveawayPendingWin {
  id: string;
  userId: string;
  period: GiveawayPeriod;
  skin: Skin;
  createdAt: number;
}

export async function fetchGiveawayWinners(limit = 24): Promise<GiveawayWinnerRecord[]> {
  try {
    const res = await fetch(`/api/giveaways/winners?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json() as { winners?: GiveawayWinnerRecord[] };
    return data.winners ?? [];
  } catch {
    return [];
  }
}

export async function fetchPendingGiveawayWins(userId: string): Promise<GiveawayPendingWin[]> {
  try {
    const res = await fetch(`/api/giveaways/pending-win?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return [];
    const data = await res.json() as { pending?: GiveawayPendingWin[] };
    return data.pending ?? [];
  } catch {
    return [];
  }
}

export async function ackGiveawayWin(userId: string, pendingId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/giveaways/pending-win/ack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, pendingId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchGiveawayDetail(
  period: GiveawayPeriod,
  userId?: string | null,
): Promise<GiveawayDetailResponse | null> {
  try {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`/api/giveaways/${period}${query}`);
    if (!res.ok) return null;
    return await res.json() as GiveawayDetailResponse;
  } catch {
    return null;
  }
}

export async function joinGiveaway(payload: {
  period: GiveawayPeriod;
  userId: string;
  email: string;
  nickname?: string;
  avatarId?: number;
}): Promise<{ ok: boolean; error?: string; alreadyJoined?: boolean }> {
  try {
    const res = await fetch('/api/giveaways/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({})) as { error?: string; alreadyJoined?: boolean };
    if (!res.ok) return { ok: false, error: data.error ?? 'No se pudo unir al sorteo.' };
    return { ok: true, alreadyJoined: data.alreadyJoined };
  } catch {
    return { ok: false, error: 'Error de red.' };
  }
}

export async function recordGiveawayDeposit(payload: {
  userId: string;
  amount: number;
  email?: string;
  nickname?: string;
  avatarId?: number;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/giveaways/deposit-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
