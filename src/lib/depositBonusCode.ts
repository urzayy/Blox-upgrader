export const DEPOSIT_BONUS_PERCENT = 2;

/** Add valid codes here later, e.g. WELCOME: 2 */
const VALID_CODES: Record<string, number> = {};

export interface AppliedDepositBonus {
  code: string;
  percent: number;
}

export function normalizeBonusCode(code: string): string {
  return code.trim().toUpperCase();
}

export function validateDepositBonusCode(code: string): {
  valid: boolean;
  percent: number;
  error?: string;
} {
  const normalized = normalizeBonusCode(code);
  if (!normalized) {
    return { valid: false, percent: 0, error: 'Enter a code.' };
  }

  const percent = VALID_CODES[normalized];
  if (!percent) {
    return { valid: false, percent: 0, error: 'Invalid code.' };
  }

  return { valid: true, percent };
}

export function calcDepositCreditTotal(baseTotal: number, bonusPercent: number): number {
  if (!Number.isFinite(baseTotal) || baseTotal <= 0 || bonusPercent <= 0) return baseTotal;
  return Math.floor(baseTotal + (baseTotal * bonusPercent) / 100);
}
