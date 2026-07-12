import type { BattleMode, BattleFormat, BattlePrivacy } from './caseBattles';

export const BATTLE_FORMATS: {
  id: BattleFormat;
  label: string;
  maxPlayers: number;
  teamSizes?: number[];
}[] = [
  { id: '1v1', label: '1 vs 1', maxPlayers: 2 },
  { id: '1v1v1', label: '1 vs 1 vs 1', maxPlayers: 3 },
  { id: '1v1v1v1', label: '1 vs 1 vs 1 vs 1', maxPlayers: 4 },
  { id: '2v2', label: '2 vs 2', maxPlayers: 4, teamSizes: [2, 2] },
  { id: '3v3', label: '3 vs 3', maxPlayers: 6, teamSizes: [3, 3] },
];

/** Formats hidden from UI and live listings (legacy battles may still exist in storage). */
export const DISABLED_BATTLE_FORMATS: BattleFormat[] = ['2v2v2'];

export function isBattleFormatAvailable(format: BattleFormat): boolean {
  return !DISABLED_BATTLE_FORMATS.includes(format);
}

export const BATTLE_MODE_DESCRIPTIONS: Record<BattleMode, string> = {
  classic:
    'Classic mode: compete for the highest total value from the selected cases. Whoever gets the highest drop wins.',
  underdog:
    'Underdog mode: whoever pulls the lowest total value wins. Great for comeback battles.',
  share:
    'Share mode: everything won at the end of the battle is split equally among all players.',
  jackpot:
    'Jackpot mode: the more value you pull, the higher your odds on the final wheel. One spin decides who takes it (or the whole team).',
  'crazy-jackpot':
    'Crazy jackpot: same as jackpot, but whoever pulls the least has the same odds as everyone else on the final wheel.',
};

export function getBattleFormatMeta(format: BattleFormat) {
  return BATTLE_FORMATS.find(entry => entry.id === format) ?? BATTLE_FORMATS[0];
}

export const BATTLE_LOAN_MIN_PERCENT = 1;
export const BATTLE_LOAN_MAX_PERCENT = 90;

export const BATTLE_LOAN_MODE_TOOLTIP =
  'Lowers what you pay to enter and what you keep if you win. Example: at 90% you only pay 10% of the entry, but if you win you keep 10% of the prize.';

export function battleLoanSharePercent(loanPercent: number): number {
  return Math.max(0, Math.min(100, 100 - loanPercent));
}

export function battleLoanEntryCost(
  fullCost: number,
  loanMode: boolean,
  loanPercent: number,
): number {
  if (!loanMode || fullCost <= 0) return fullCost;
  const share = battleLoanSharePercent(loanPercent);
  return Math.max(1, Math.round((fullCost * share) / 100));
}

export function formatPrivacyLabel(privacy: BattlePrivacy): string {
  return privacy === 'public' ? 'Public' : 'Private';
}
