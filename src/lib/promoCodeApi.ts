export interface PromoCodeEntry {
  code: string;
  percent: number;
  expiresAt: number | null;
  createdAt: number;
  createdBy: string;
  active: boolean;
}

export interface PromoCodeValidation {
  valid: boolean;
  percent: number;
  error?: string;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function validatePromoCode(code: string): Promise<PromoCodeValidation> {
  const query = new URLSearchParams({ code: code.trim() });
  return api<PromoCodeValidation>(`/api/promo-codes/validate?${query.toString()}`);
}

export async function fetchAdminPromoCodes(adminEmail: string): Promise<PromoCodeEntry[]> {
  const query = new URLSearchParams({ adminEmail });
  const data = await api<{ codes: PromoCodeEntry[] }>(`/api/admin/promo-codes?${query.toString()}`);
  return data.codes;
}

export async function createAdminPromoCode(payload: {
  adminEmail: string;
  code: string;
  percent: number;
  durationValue?: number;
  durationUnit: 'hours' | 'days' | 'permanent';
}): Promise<PromoCodeEntry> {
  const data = await api<{ entry: PromoCodeEntry }>('/api/admin/promo-codes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.entry;
}

export async function deleteAdminPromoCode(adminEmail: string, code: string): Promise<void> {
  const query = new URLSearchParams({ adminEmail });
  await api<{ ok: boolean }>(`/api/admin/promo-codes/${encodeURIComponent(code.trim())}?${query.toString()}`, {
    method: 'DELETE',
  });
}
