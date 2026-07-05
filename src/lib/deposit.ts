export const MIN_DEPOSIT_TOTAL = 100;

export function validateDepositTotal(total: number): { ok: boolean; error?: string } {
  if (!Number.isFinite(total) || total <= 0) {
    return { ok: false, error: 'Selecciona al menos una skin para depositar.' };
  }
  if (total < MIN_DEPOSIT_TOTAL) {
    return {
      ok: false,
      error: `El depósito mínimo es ${MIN_DEPOSIT_TOTAL.toLocaleString('es-ES')} monedas en total.`,
    };
  }
  return { ok: true };
}
