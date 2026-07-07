/** Loss consolation case — enabled in production. */
export const LOSS_CONSOLATION_ENABLED = true;

/** Minimum lost stake (coins) to trigger the consolation case. */
export const MIN_LOSS_CONSOLATION_STAKE = 15;

export function qualifiesForLossConsolationCase(lostValue: number): boolean {
  return LOSS_CONSOLATION_ENABLED && lostValue >= MIN_LOSS_CONSOLATION_STAKE;
}
