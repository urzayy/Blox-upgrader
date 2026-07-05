import type { Skin } from '../data/skins';

export interface InventoryGrantRecord {
  id: string;
  targetEmail: string;
  grantedBy: string;
  skin: Skin;
  createdAt: number;
  status: 'pending' | 'applied';
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function normalizeGrantEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidGrantEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeGrantEmail(email));
}

export async function createInventoryGrant(
  targetEmail: string,
  grantedBy: string,
  skin: Skin,
  quantity = 1,
): Promise<InventoryGrantRecord[]> {
  const data = await api<{ grants: InventoryGrantRecord[] }>('/api/inventory-grants', {
    method: 'POST',
    body: JSON.stringify({
      targetEmail: normalizeGrantEmail(targetEmail),
      grantedBy: normalizeGrantEmail(grantedBy),
      skin,
      quantity,
    }),
  });
  return data.grants;
}

export async function fetchPendingInventoryGrants(email: string): Promise<InventoryGrantRecord[]> {
  const normalized = normalizeGrantEmail(email);
  const data = await api<{ grants: InventoryGrantRecord[] }>(
    `/api/inventory-grants?email=${encodeURIComponent(normalized)}`,
  );
  return data.grants;
}

export async function acknowledgeInventoryGrants(email: string, grantIds: string[]): Promise<void> {
  if (!grantIds.length) return;
  await api('/api/inventory-grants/ack', {
    method: 'POST',
    body: JSON.stringify({
      email: normalizeGrantEmail(email),
      grantIds,
    }),
  });
}
