export interface AccountBanRecord {
  email: string;
  bannedAt: number;
  bannedUntil: number | null;
  bannedBy: string;
  reason: string | null;
  days: number | null;
  permanent: boolean;
}

export async function banUserByEmail(
  adminEmail: string,
  targetEmail: string,
  days: number | null,
  reason?: string,
): Promise<AccountBanRecord> {
  const res = await fetch('/api/admin/ban-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminEmail,
      email: targetEmail.trim().toLowerCase(),
      days,
      reason: reason?.trim() || null,
    }),
  });
  const data = await res.json().catch(() => ({})) as { ban?: AccountBanRecord; message?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? 'No se pudo banear al usuario.');
  }
  if (!data.ban) throw new Error('No se pudo banear al usuario.');
  return data.ban;
}

export async function unbanUserByEmail(
  adminEmail: string,
  targetEmail: string,
): Promise<{ email: string; unbanned: boolean }> {
  const res = await fetch('/api/admin/unban-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminEmail,
      email: targetEmail.trim().toLowerCase(),
    }),
  });
  const data = await res.json().catch(() => ({})) as { email?: string; unbanned?: boolean; message?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? 'No se pudo desbanear al usuario.');
  }
  return { email: data.email ?? targetEmail, unbanned: data.unbanned ?? true };
}

export async function fetchActiveBans(adminEmail: string): Promise<AccountBanRecord[]> {
  const res = await fetch(`/api/admin/bans?adminEmail=${encodeURIComponent(adminEmail)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string; error?: string };
    throw new Error(data.message ?? data.error ?? 'No se pudo cargar los baneos.');
  }
  const data = await res.json() as { bans: AccountBanRecord[] };
  return data.bans ?? [];
}
