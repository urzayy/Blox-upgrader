import gsap from 'gsap';

export interface ReelScrollOptions {
  element: HTMLElement;
  from: number;
  to: number;
  durationMs: number;
  turbo?: boolean;
  axis?: 'x' | 'y';
  onComplete: () => void;
}

export interface RoyalReelScrollOptions extends ReelScrollOptions {
  turbo?: boolean;
}

/** One continuous scroll — turbo uses a snappier curve over half the normal duration. */
export function runReelSmoothScroll({
  element,
  from,
  to,
  durationMs,
  turbo = false,
  axis = 'x',
  onComplete,
}: ReelScrollOptions): gsap.core.Tween {
  const prop = axis === 'y' ? 'y' : 'x';
  gsap.set(element, { [prop]: -from, force3D: true });

  return gsap.to(element, {
    [prop]: -to,
    duration: durationMs / 1000,
    ease: turbo ? 'power4.out' : 'power2.out',
    force3D: true,
    onComplete,
  });
}

/** Longer, dramatic deceleration for the BloxRoyal second pass. */
export function runRoyalReelScroll({
  element,
  from,
  to,
  durationMs,
  turbo = false,
  axis = 'x',
  onComplete,
}: RoyalReelScrollOptions): gsap.core.Tween {
  const prop = axis === 'y' ? 'y' : 'x';
  gsap.set(element, { [prop]: -from, force3D: true });

  return gsap.to(element, {
    [prop]: -to,
    duration: durationMs / 1000,
    ease: turbo ? 'power3.out' : 'power1.out',
    force3D: true,
    onComplete,
  });
}

export function reelCardDepth(
  index: number,
  offset: number,
  viewportWidth: number,
  itemStride: number,
  itemCenter: number,
): { scale: number; brightness: number } {
  const itemCenterX = index * itemStride + itemCenter;
  const viewportCenterX = offset + viewportWidth / 2;
  const dist = Math.abs(itemCenterX - viewportCenterX);
  const norm = Math.min(1, dist / (itemStride * 1.35));

  return {
    scale: 1 - norm * 0.08,
    brightness: 1 - norm * 0.28,
  };
}

export function reelCardDepthVertical(
  index: number,
  offset: number,
  viewportHeight: number,
  itemStride: number,
  itemCenter: number,
): { scale: number; brightness: number } {
  const itemCenterY = index * itemStride + itemCenter;
  const viewportCenterY = offset + viewportHeight / 2;
  const dist = Math.abs(itemCenterY - viewportCenterY);
  const norm = Math.min(1, dist / (itemStride * 1.35));

  return {
    scale: 1 - norm * 0.08,
    brightness: 1 - norm * 0.28,
  };
}
