export interface PlayerAnnouncement {
  id: string;
  title: string;
  message: string;
  createdAt: number;
  createdBy: string;
  active: true;
}

export async function fetchActiveAnnouncement(): Promise<PlayerAnnouncement | null> {
  const res = await fetch('/api/announcement/active');
  if (!res.ok) return null;
  const data = await res.json() as { announcement?: PlayerAnnouncement | null };
  return data.announcement ?? null;
}

export async function fetchAdminAnnouncement(adminEmail: string): Promise<PlayerAnnouncement | null> {
  const res = await fetch(`/api/admin/announcement?adminEmail=${encodeURIComponent(adminEmail)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error === 'forbidden' ? 'Access denied.' : 'Could not load announcement.');
  }
  const data = await res.json() as { announcement?: PlayerAnnouncement | null };
  return data.announcement ?? null;
}

export async function publishAnnouncement(
  adminEmail: string,
  title: string,
  message: string,
): Promise<PlayerAnnouncement> {
  const res = await fetch('/api/admin/announcement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminEmail, title, message }),
  });
  const data = await res.json().catch(() => ({})) as { error?: string; announcement?: PlayerAnnouncement };
  if (!res.ok) {
    if (data.error === 'title_and_message_required') {
      throw new Error('Title and message are required.');
    }
    if (data.error === 'forbidden') {
      throw new Error('Access denied.');
    }
    throw new Error('Could not publish announcement.');
  }
  if (!data.announcement) throw new Error('Invalid server response.');
  return data.announcement;
}

export async function clearAnnouncement(adminEmail: string): Promise<void> {
  const res = await fetch('/api/admin/announcement/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminEmail }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error === 'forbidden' ? 'Access denied.' : 'Could not deactivate announcement.');
  }
}
