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
