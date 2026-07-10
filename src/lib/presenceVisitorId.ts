const STORAGE_KEY = 'blox-upgrader/presence-visitor-id';

export function getPresenceVisitorId(): string {
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const created = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
