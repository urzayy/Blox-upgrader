export interface PresenceHeartbeatPayload {
  userId?: string | null;
  visitorId: string;
}

export interface AdminPresenceSnapshot {
  count: number;
  updatedAt: number;
}

export async function sendPresenceHeartbeat(payload: PresenceHeartbeatPayload): Promise<void> {
  try {
    await fetch('/api/presence/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    /* offline / dev without API */
  }
}

export async function fetchAdminPresenceCount(adminEmail: string): Promise<AdminPresenceSnapshot | null> {
  try {
    const res = await fetch(
      `/api/admin/presence?adminEmail=${encodeURIComponent(adminEmail.trim().toLowerCase())}`,
    );
    if (!res.ok) return null;
    const data = await res.json() as AdminPresenceSnapshot;
    if (typeof data.count !== 'number') return null;
    return data;
  } catch {
    return null;
  }
}
