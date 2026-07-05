function storageKey(userId: string): string {
  return `blox-upgrader/processed-withdraws/${userId}`;
}

export function loadProcessedWithdrawTickets(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

export function saveProcessedWithdrawTickets(userId: string, ids: Iterable<string>): void {
  localStorage.setItem(storageKey(userId), JSON.stringify([...ids]));
}

export function markWithdrawTicketProcessed(userId: string, ticketId: string): void {
  const ids = loadProcessedWithdrawTickets(userId);
  ids.add(ticketId);
  saveProcessedWithdrawTickets(userId, ids);
}
