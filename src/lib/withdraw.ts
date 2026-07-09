export const MIN_WITHDRAW_TOTAL = 20;

export function validateWithdrawTotal(total: number): { ok: boolean; error?: string } {
  if (!Number.isFinite(total) || total <= 0) {
    return { ok: false, error: 'Select at least one skin to withdraw.' };
  }
  if (total < MIN_WITHDRAW_TOTAL) {
    return {
      ok: false,
      error: `Minimum withdrawal is ${MIN_WITHDRAW_TOTAL.toLocaleString('en-US')} coins total.`,
    };
  }
  return { ok: true };
}
