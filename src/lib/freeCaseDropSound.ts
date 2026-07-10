import { getFreeCaseDropSound } from './freeCaseLoot';
import { sfx } from './audio';

export function playFreeCaseLandSound(
  caseSlug: string,
  skinId: string,
  options?: { keepRoyalRoll?: boolean },
): void {
  sfx.wheelLand(options);
  const dropSound = getFreeCaseDropSound(caseSlug, skinId);
  if (dropSound === 'common') sfx.caseDropCommon();
  else if (dropSound === 'mid') sfx.caseDropMid();
}