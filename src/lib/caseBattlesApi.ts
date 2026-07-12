import type { CaseBattle } from './caseBattles';

export async function fetchLiveBattlesFromServer(): Promise<CaseBattle[] | null> {
  try {
    const res = await fetch('/api/case-battles', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json() as { battles?: CaseBattle[] };
    return Array.isArray(data.battles) ? data.battles : [];
  } catch {
    return null;
  }
}

export async function fetchCaseBattleFromServer(battleId: string): Promise<CaseBattle | null> {
  try {
    const res = await fetch(`/api/case-battles/${encodeURIComponent(battleId)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json() as { battle?: CaseBattle | null };
    return data.battle ?? null;
  } catch {
    return null;
  }
}

export async function upsertCaseBattleOnServer(battle: CaseBattle): Promise<boolean> {
  try {
    const res = await fetch(`/api/case-battles/${encodeURIComponent(battle.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ battle }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function removeCaseBattleOnServer(battleId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/case-battles/${encodeURIComponent(battleId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}
