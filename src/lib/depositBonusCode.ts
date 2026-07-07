import { validatePromoCode } from './promoCodeApi';

export const DEPOSIT_BONUS_PERCENT = 2;

export interface AppliedDepositBonus {
  code: string;
  percent: number;
}

export function normalizeBonusCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function validateDepositBonusCode(code: string): Promise<{
  valid: boolean;
  percent: number;
  error?: string;
}> {
  try {
    return await validatePromoCode(code);
  } catch {
    return { valid: false, percent: 0, error: 'Could not validate the code. Try again.' };
  }
}

export function calcDepositCreditTotal(baseTotal: number, bonusPercent: number): number {
  if (!Number.isFinite(baseTotal) || baseTotal <= 0 || bonusPercent <= 0) return baseTotal;
  return Math.floor(baseTotal + (baseTotal * bonusPercent) / 100);
}
