import type { Skin } from '../data/skins';
import type { FreeCaseLootItem } from './freeCaseLoot';
import { qualifiesForRoyalSpin } from './freeCaseRoyal';
import type { FreeCaseReelItem } from './freeCaseReel';

/** Visible reel slots at offset 0 — must match CaseOpenPreview layout. */
export const PREVIEW_REEL_SLOTS = [0, 1, 2, 3, 4, 5, 6] as const;

/** Pick 6 distinct skins from case loot for the static side preview (3 left + 3 right). */
export function buildCasePreviewSkins(slug: string, loot: FreeCaseLootItem[]): Skin[] {
  if (!loot.length) return [];

  const sorted = [...loot].sort((a, b) => b.skin.price - a.skin.price);
  const n = sorted.length;
  const ratioIndices = [
    0,
    Math.floor(n * 0.12),
    Math.floor(n * 0.28),
    Math.floor(n * 0.52),
    Math.floor(n * 0.72),
    Math.floor(n * 0.88),
  ];

  const seen = new Set<string>();
  const picks: Skin[] = [];

  for (const index of ratioIndices) {
    const item = sorted[Math.min(index, n - 1)];
    if (!item || seen.has(item.skin.id)) continue;
    seen.add(item.skin.id);
    picks.push(item.skin);
  }

  for (const item of sorted) {
    if (picks.length >= 6) break;
    if (seen.has(item.skin.id)) continue;
    seen.add(item.skin.id);
    picks.push(item.skin);
  }

  void slug;
  return picks.slice(0, 6);
}

export function splitPreviewSides(skins: Skin[]): { left: Skin[]; right: Skin[] } {
  if (!skins.length) return { left: [], right: [] };
  const leftCount = Math.ceil(skins.length / 2);
  return {
    left: skins.slice(0, leftCount),
    right: skins.slice(leftCount),
  };
}

function padPreviewSkins(skins: Skin[]): Skin[] {
  if (skins.length >= 6) return skins.slice(0, 6);
  if (!skins.length) return [];

  const padded = [...skins];
  let index = 0;
  while (padded.length < 6) {
    padded.push(skins[index % skins.length]);
    index += 1;
  }

  return padded.slice(0, 6);
}

/** Map preview skins onto the first visible reel band so the spin starts from the same weapons. */
export function applyPreviewPrefixToReel(
  reel: FreeCaseReelItem[],
  slug: string,
  previewSkins: Skin[],
  winIndex: number,
): void {
  const padded = padPreviewSkins(previewSkins);
  if (padded.length < 6) return;

  const [left0, left1, left2, right0, right1, right2] = padded;
  const slotSkins: Record<number, Skin> = {
    0: left0,
    1: left1,
    2: left2,
    3: right0,
    4: right1,
    5: right2,
    6: left0,
  };

  for (const index of PREVIEW_REEL_SLOTS) {
    if (index === winIndex) continue;
    const skin = slotSkins[index];
    if (!skin) continue;

    reel[index] = {
      skin,
      isJackpot: false,
      isRoyal: false,
      isRoyalLoot: qualifiesForRoyalSpin(slug, skin.id),
    };
  }
}
