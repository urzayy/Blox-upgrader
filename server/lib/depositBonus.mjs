export const DEPOSIT_BONUS_PERCENT = 2;

const VALID_CODES = {};

export function normalizeBonusCode(code) {
  return String(code).trim().toUpperCase();
}

export function validateDepositBonusCode(code) {
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

export function calcDepositCreditTotal(baseTotal, bonusPercent) {
  if (!Number.isFinite(baseTotal) || baseTotal <= 0 || bonusPercent <= 0) return baseTotal;
  return Math.floor(baseTotal + (baseTotal * bonusPercent) / 100);
}

export const ROBUX_TO_SALDO_RATE = 1.2;

export function calcRobuxBaseCredit(robuxAmount) {
  if (!Number.isFinite(robuxAmount) || robuxAmount <= 0) return 0;
  return Math.round(robuxAmount * ROBUX_TO_SALDO_RATE * 100) / 100;
}

export function resolveRobuxDepositBonus(body, robuxAmount) {
  const baseTotal = calcRobuxBaseCredit(robuxAmount);
  if (baseTotal <= 0) {
    return { error: 'invalid robux deposit' };
  }
  const bonus = resolveDepositBonus(body, baseTotal);
  return { ...bonus, baseTotal };
}

export function resolveDepositBonus(body, baseTotal) {
  const rawCode = body?.bonusCode;
  if (!rawCode) {
    return { creditTotal: baseTotal, bonusCode: null, bonusPercent: 0 };
  }

  const result = validateDepositBonusCode(rawCode);
  if (!result.valid) {
    return { error: result.error ?? 'Invalid code.' };
  }

  return {
    creditTotal: calcDepositCreditTotal(baseTotal, result.percent),
    bonusCode: normalizeBonusCode(rawCode),
    bonusPercent: result.percent,
  };
}
