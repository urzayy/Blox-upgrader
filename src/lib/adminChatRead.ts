import type { ChatMessage } from './withdrawChat';

const READ_KEY_PREFIX = 'blox-upgrader/admin-chat-read/';

export function getAdminTicketLastRead(ticketId: string): number | null {
  try {
    const raw = localStorage.getItem(`${READ_KEY_PREFIX}${ticketId}`);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function markAdminTicketRead(ticketId: string, at = Date.now()): void {
  try {
    localStorage.setItem(`${READ_KEY_PREFIX}${ticketId}`, String(at));
  } catch {
    /* storage blocked */
  }
}

export function markAdminTicketReadFromMessages(ticketId: string, messages: ChatMessage[]): void {
  const userMessages = messages.filter(message => message.senderRole === 'user');
  if (!userMessages.length) {
    markAdminTicketRead(ticketId);
    return;
  }
  const lastAt = Math.max(...userMessages.map(message => message.createdAt));
  markAdminTicketRead(ticketId, lastAt);
}

export function getAdminLastReadMap(): Record<string, number> {
  const map: Record<string, number> = {};
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith(READ_KEY_PREFIX)) continue;
      const ticketId = key.slice(READ_KEY_PREFIX.length);
      const ts = getAdminTicketLastRead(ticketId);
      if (ts !== null) map[ticketId] = ts;
    }
  } catch {
    /* noop */
  }
  return map;
}
