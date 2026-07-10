export type GiveawayPeriod = 'monthly' | 'weekly' | 'daily';

export interface GiveawayPrize {
  weaponLabel: string;
  skinName: string;
  wear: string;
  price: number;
  image: string | null;
}

export interface GiveawayDefinition {
  id: GiveawayPeriod;
  title: string;
  subtitle: string;
  accent: string;
  glow: string;
  border: string;
  headerIcon: 'crown' | 'calendar' | 'bolt';
}

export const GIVEAWAY_COINS_PER_ENTRY = 200;

export function calcGiveawayEntries(totalDeposited: number): number {
  const deposited = Math.max(0, Math.floor(totalDeposited));
  return Math.floor(deposited / GIVEAWAY_COINS_PER_ENTRY);
}

export function calcGiveawayChance(myEntries: number, totalEntries: number): number {
  if (totalEntries <= 0 || myEntries <= 0) return 0;
  return (myEntries / totalEntries) * 100;
}

export function splitSkinDisplayName(name: string): { weaponLabel: string; skinName: string } {
  const parts = name.split('|').map(part => part.trim());
  if (parts.length >= 2) {
    return { weaponLabel: parts[0], skinName: parts.slice(1).join(' | ') };
  }
  return { weaponLabel: name, skinName: name };
}

export function skinToGiveawayPrize(skin: {
  name: string;
  wear: string;
  price: number;
  image: string;
}): GiveawayPrize {
  const { weaponLabel, skinName } = splitSkinDisplayName(skin.name);
  return {
    weaponLabel,
    skinName,
    wear: skin.wear,
    price: skin.price,
    image: skin.image,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Fixed cycle lengths for each giveaway tier. */
export const GIVEAWAY_PERIOD_DAYS: Record<GiveawayPeriod, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

/** Shared anchor so every user sees the same countdown boundaries. */
const GIVEAWAY_CYCLE_ANCHOR = Date.parse('2026-01-01T00:00:00Z');

export function getGiveawayPeriodMs(period: GiveawayPeriod): number {
  return GIVEAWAY_PERIOD_DAYS[period] * DAY_MS;
}

/** @deprecated Use server endsAt when a giveaway is active. */
export function getGiveawayEndAt(period: GiveawayPeriod, now = Date.now()): number {
  const periodMs = getGiveawayPeriodMs(period);
  const elapsed = Math.max(0, now - GIVEAWAY_CYCLE_ANCHOR);
  const cycleIndex = Math.floor(elapsed / periodMs);
  return GIVEAWAY_CYCLE_ANCHOR + (cycleIndex + 1) * periodMs;
}
const PLACEHOLDER_PRIZE: GiveawayPrize = {
  weaponLabel: 'Por definir',
  skinName: '—',
  wear: 'FT',
  price: 0,
  image: null,
};

export const GIVEAWAY_TEMPLATES: Record<GiveawayPeriod, GiveawayDefinition> = {
  monthly: {
    id: 'monthly',
    title: 'MONTHLY',
    subtitle: 'GIVEAWAY',
    accent: '#F59E0B',
    glow: 'rgba(245,158,11,0.35)',
    border: 'rgba(245,158,11,0.45)',
    headerIcon: 'crown',
  },
  weekly: {
    id: 'weekly',
    title: 'WEEKLY',
    subtitle: 'GIVEAWAY',
    accent: '#F43F5E',
    glow: 'rgba(244,63,94,0.32)',
    border: 'rgba(244,63,94,0.42)',
    headerIcon: 'calendar',
  },
  daily: {
    id: 'daily',
    title: 'DAILY',
    subtitle: 'GIVEAWAY',
    accent: '#10B981',
    glow: 'rgba(16,185,129,0.32)',
    border: 'rgba(16,185,129,0.42)',
    headerIcon: 'bolt',
  },
};

export const GIVEAWAYS: GiveawayDefinition[] = [
  GIVEAWAY_TEMPLATES.monthly,
  GIVEAWAY_TEMPLATES.weekly,
  GIVEAWAY_TEMPLATES.daily,
];

export { PLACEHOLDER_PRIZE };
