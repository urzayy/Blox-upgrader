export const MIN_DEPOSIT_TOTAL = 500;

export function validateDepositTotal(total: number): { ok: boolean; error?: string } {
  if (!Number.isFinite(total) || total <= 0) {
    return { ok: false, error: 'Select at least one skin to deposit.' };
  }
  if (total < MIN_DEPOSIT_TOTAL) {
    return {
      ok: false,
      error: `Minimum deposit is ${MIN_DEPOSIT_TOTAL.toLocaleString('en-US')} coins total.`,
    };
  }
  return { ok: true };
}
