/** Dev-only: skip level + cooldown on every daily free case for testing. */
export const DEV_BYPASS_ALL_FREE_CASES = import.meta.env.DEV;

export function isFreeCaseUnlockedForPlayer(
  tierLevel: number,
  playerLevel: number,
  _slug: string,
): boolean {
  if (DEV_BYPASS_ALL_FREE_CASES) return true;
  return playerLevel >= tierLevel;
}

export function shouldBypassFreeCaseCooldown(_slug: string): boolean {
  return DEV_BYPASS_ALL_FREE_CASES;
}
