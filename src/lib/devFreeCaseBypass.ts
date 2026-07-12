export {
  canPlayerOpenFreeCase,
  isFreeCaseUnlockedForPlayer,
  playerLevelForFreeCases,
} from './freeCaseUnlock';

export function shouldBypassFreeCaseCooldown(_slug: string): boolean {
  return false;
}
