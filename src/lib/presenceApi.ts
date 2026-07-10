export interface PresenceHeartbeatPayload {
  userId?: string | null;
  visitorId: string;
}

export async function sendPresenceHeartbeat(payload: PresenceHeartbeatPayload): Promise<void> {
  try {
    await fetch('/api/presence/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    /* offline */
  }
}
