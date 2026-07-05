import { findSkinImageByName, type FeedItem } from '../data/skins';

/** Old bot feed names mapped to real catalog skin names. */
const LEGACY_FEED_NAME_ALIASES: Record<string, string> = {
  'AK-47 | Redline': 'Karambit | Scarlet',
  'AWP | Asiimov': 'AWP | Beta',
  'M4A4 | Howl': 'Karambit | Fade',
  'Glock-18 | Fade': 'Flip | Fade',
  'USP-S | Kill Confirmed': 'Stiletto | Violet',
  'Desert Eagle | Blaze': 'Bayonet | Scarlet',
  'Butterfly Knife | Doppler': 'Butterfly | Fade',
  'AWP | Dragon Lore': 'AWP | Beta',
  'M9 Bayonet | Tiger Tooth': 'Bayonet | Tiger Stripes',
};

export function resolveFeedSkinImage(name: string, storedImage?: string): string | undefined {
  if (storedImage) return storedImage;
  if (!name || name.includes(' skins · ')) return undefined;

  const direct = findSkinImageByName(name);
  if (direct) return direct;

  const alias = LEGACY_FEED_NAME_ALIASES[name];
  if (alias) return findSkinImageByName(alias);

  return undefined;
}

/** WIN → target skin. LOSE → input skin. */
export function getFeedResult(item: FeedItem): { label: string; image?: string } {
  if (item.won) {
    return {
      label: item.targetSkin,
      image: resolveFeedSkinImage(item.targetSkin, item.targetImage),
    };
  }
  return {
    label: item.inputSkin,
    image: resolveFeedSkinImage(item.inputSkin, item.inputImage),
  };
}

export { LEGACY_FEED_NAME_ALIASES };
