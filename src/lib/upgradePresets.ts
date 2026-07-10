import type { Skin } from '../data/skins';

export const MULTIPLIERS = [2, 3, 5] as const;
export const CAPS = [25, 35, 50, 75] as const;

/** Preset buttons pick a target skin by ideal price — odds come from real prices only. */
export function idealTargetPrice(
  inputPrice: number,
  mult: number | null,
  cap: number | null,
): number | null {
  if (cap) return (inputPrice * 100) / cap;
  if (mult) return inputPrice * mult;
  return null;
}

export function findTargetForPreset(
  pool: Skin[],
  inputPrice: number,
  mult: number | null,
  cap: number | null,
): Skin | null {
  const ideal = idealTargetPrice(inputPrice, mult, cap);
  if (!inputPrice || ideal == null) return null;

  const candidates = pool.filter(s => s.price > inputPrice);
  if (!candidates.length) return null;

  const atOrAbove = candidates.filter(s => s.price >= ideal);
  const searchPool = atOrAbove.length ? atOrAbove : candidates;

  return searchPool.reduce((best, skin) =>
    Math.abs(skin.price - ideal) < Math.abs(best.price - ideal) ? skin : best,
  );
}
