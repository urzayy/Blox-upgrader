const BALANCE_VERSION = 1;

function balanceKey(userId: string | null): string {
  return userId
    ? `blox-upgrader/balance/${userId}`
    : 'blox-upgrader/balance/guest';
}

function versionKey(userId: string | null): string {
  return userId
    ? `blox-upgrader/balance-version/${userId}`
    : 'blox-upgrader/balance-version/guest';
}

export function loadBalance(userId: string | null = null): number {
  const key = balanceKey(userId);
  const vKey = versionKey(userId);

  try {
    const version = localStorage.getItem(vKey);
    if (version !== String(BALANCE_VERSION)) {
      localStorage.setItem(vKey, String(BALANCE_VERSION));
      localStorage.setItem(key, '0');
      return 0;
    }

    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveBalance(balance: number, userId: string | null = null): void {
  try {
    localStorage.setItem(balanceKey(userId), String(Math.max(0, balance)));
    localStorage.setItem(versionKey(userId), String(BALANCE_VERSION));
  } catch {
    /* storage blocked */
  }
}
