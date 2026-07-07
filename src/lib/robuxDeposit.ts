import { calcDepositCreditTotal } from './depositBonusCode';

/** Each deposited Robux credits this many site coins (SALDO). */
export const ROBUX_TO_SALDO_RATE = 1.2;

export const MIN_ROBUX_DEPOSIT = 50;

export function validateRobuxDepositAmount(robuxAmount: number): { ok: boolean; error?: string } {
  if (!Number.isFinite(robuxAmount) || robuxAmount <= 0 || !Number.isInteger(robuxAmount)) {
    return { ok: false, error: 'Enter a valid whole number of Robux.' };
  }
  if (robuxAmount < MIN_ROBUX_DEPOSIT) {
    return {
      ok: false,
      error: `Minimum deposit is ${MIN_ROBUX_DEPOSIT.toLocaleString('en-US')} Robux.`,
    };
  }
  return { ok: true };
}

export function calcRobuxBaseCredit(robuxAmount: number): number {
  if (!Number.isFinite(robuxAmount) || robuxAmount <= 0) return 0;
  return Math.round(robuxAmount * ROBUX_TO_SALDO_RATE * 100) / 100;
}

export function calcRobuxDepositCredit(robuxAmount: number, bonusPercent = 0): number {
  const base = calcRobuxBaseCredit(robuxAmount);
  if (bonusPercent > 0) return calcDepositCreditTotal(base, bonusPercent);
  return base;
}
