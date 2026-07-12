export const COIN_ICON_URL = '/coin.png';

/** Formatted amount without currency symbol (coin shown in UI separately). */
export function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

/** @deprecated Use formatPrice + CoinPrice in UI. Kept for logs/text. */
export function formatUSD(n: number): string {
  return formatPrice(n);
}
