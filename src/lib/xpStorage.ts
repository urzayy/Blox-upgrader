import {
  applyWagerXp,
  buildPlayerLevelState,
  type PlayerLevelProgress,
  type PlayerLevelState,
  wageredCoinsToXp,
} from './playerLevel';

const XP_VERSION = 2;
const XP_UPDATED_EVENT = 'xp-updated';

function xpKey(userId: string): string {
  return `bloxupgrader_xp_v${XP_VERSION}_${userId}`;
}

function versionKey(userId: string): string {
  return `bloxupgrader_xp_v${XP_VERSION}_ver_${userId}`;
}

function defaultProgress(): PlayerLevelProgress {
  return { level: 1, xp: 0 };
}

function migrateV1TotalXp(totalXp: number): PlayerLevelProgress {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));

  const oldThresholds = [
    200, 500, 800, 1100, 1500, 2000, 2800, 3700, 4800, 6100,
    7600, 9300, 11300, 13600, 16200, 19100, 22400, 26100, 30200, 34800,
    39900, 45500, 51700, 58500, 66000, 74200, 83200, 93000, 103700, 115400,
    128200, 142200, 157500, 174200, 192400, 212200, 233800, 257300, 282900, 310800,
    341200, 374300, 410300, 449500, 492200, 538700, 589400, 644700, 705000, 770800,
    842600, 921000, 1006700, 1100500, 1203100, 1315500, 1438700, 1573900, 1722300, 1885300,
    2064300, 2260900, 2476900, 2714300, 2975400, 3262700, 3578700, 3926600, 4309300, 4730200,
    5193200, 5702500, 6262700, 6878900, 7556800, 8302400, 9122600, 10024900, 11017400, 12109100,
    13310000, 14631000, 16084000, 17682000, 19440000, 21374000, 23501000, 25842000, 28417000, 31250000,
  ];

  while (level < 90 && remaining >= (oldThresholds[level - 1] ?? Number.MAX_SAFE_INTEGER)) {
    remaining = 0;
    level += 1;
  }

  return { level, xp: remaining };
}

function parseProgress(raw: string | null): PlayerLevelProgress | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PlayerLevelProgress>;
    if (
      typeof parsed.level === 'number'
      && typeof parsed.xp === 'number'
      && Number.isFinite(parsed.level)
      && Number.isFinite(parsed.xp)
    ) {
      return {
        level: Math.max(1, Math.floor(parsed.level)),
        xp: Math.max(0, Math.floor(parsed.xp)),
      };
    }
  } catch {
    /* fall through */
  }

  const legacyTotal = Number(raw);
  if (Number.isFinite(legacyTotal) && legacyTotal >= 0) {
    return migrateV1TotalXp(legacyTotal);
  }

  return null;
}

export function loadPlayerProgress(userId: string | null | undefined): PlayerLevelProgress {
  if (!userId) return defaultProgress();

  try {
    const vKey = versionKey(userId);
    const version = localStorage.getItem(vKey);
    const raw = localStorage.getItem(xpKey(userId));

    if (version === String(XP_VERSION) && raw) {
      return parseProgress(raw) ?? defaultProgress();
    }

    const legacyRaw = localStorage.getItem(`bloxupgrader_xp_v1_${userId}`);
    const migrated = legacyRaw ? parseProgress(legacyRaw) : (raw ? parseProgress(raw) : null);
    const next = migrated ?? defaultProgress();
    savePlayerProgress(userId, next);
    localStorage.removeItem(`bloxupgrader_xp_v1_${userId}`);
    localStorage.removeItem(`bloxupgrader_xp_v1_ver_${userId}`);
    return next;
  } catch {
    return defaultProgress();
  }
}

export function savePlayerProgress(userId: string, progress: PlayerLevelProgress): void {
  try {
    localStorage.setItem(xpKey(userId), JSON.stringify({
      level: Math.max(1, Math.floor(progress.level)),
      xp: Math.max(0, Math.floor(progress.xp)),
    }));
    localStorage.setItem(versionKey(userId), String(XP_VERSION));
  } catch {
    /* noop */
  }
}

export function clearXpForUserId(userId: string): void {
  try {
    localStorage.removeItem(xpKey(userId));
    localStorage.removeItem(versionKey(userId));
  } catch {
    /* noop */
  }
}

export function notifyXpUpdated(userId: string): void {
  window.dispatchEvent(new CustomEvent(XP_UPDATED_EVENT, {
    detail: { userId },
  }));
}

export function getPlayerLevel(userId: string | null | undefined): PlayerLevelState {
  return buildPlayerLevelState(loadPlayerProgress(userId));
}

export function addWagerXp(userId: string, wageredCoins: number): PlayerLevelState {
  const gained = wageredCoinsToXp(wageredCoins);
  if (gained <= 0) return getPlayerLevel(userId);

  const next = applyWagerXp(loadPlayerProgress(userId), gained);
  savePlayerProgress(userId, next);
  const state = buildPlayerLevelState(next);
  notifyXpUpdated(userId);
  return state;
}

export function subscribeXpUpdates(
  userId: string | null | undefined,
  onUpdate: (state: PlayerLevelState) => void,
): () => void {
  const sync = () => onUpdate(getPlayerLevel(userId));

  const onEvent = (event: Event) => {
    const detail = (event as CustomEvent<{ userId?: string }>).detail;
    if (!userId || detail?.userId === userId) sync();
  };

  window.addEventListener(XP_UPDATED_EVENT, onEvent);
  window.addEventListener('storage', sync);
  return () => {
    window.removeEventListener(XP_UPDATED_EVENT, onEvent);
    window.removeEventListener('storage', sync);
  };
}
