export interface AdminStatus {
  isAdmin: boolean;
  isCreator: boolean;
}

export async function fetchAdminStatus(email: string): Promise<AdminStatus> {
  const res = await fetch(`/api/admin/status?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    return { isAdmin: false, isCreator: false };
  }
  return res.json() as Promise<AdminStatus>;
}

export async function fetchAdminEmails(creatorEmail: string): Promise<string[]> {
  const res = await fetch(
    `/api/admin/emails?creatorEmail=${encodeURIComponent(creatorEmail)}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? 'Could not load administrators.');
  }
  const data = await res.json() as { emails: string[] };
  return data.emails;
}

export async function addAdminEmail(creatorEmail: string, email: string): Promise<string[]> {
  const res = await fetch('/api/admin/emails/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creatorEmail, email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? 'Could not add administrator.');
  }
  const data = await res.json() as { emails: string[] };
  return data.emails;
}

export async function removeAdminEmail(creatorEmail: string, email: string): Promise<string[]> {
  const res = await fetch('/api/admin/emails/remove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creatorEmail, email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? 'Could not remove administrator.');
  }
  const data = await res.json() as { emails: string[] };
  return data.emails;
}
