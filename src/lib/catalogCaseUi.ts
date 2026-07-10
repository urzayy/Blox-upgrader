import {
  CASE_CATALOG,
  getCatalogCaseBySlug,
  type CatalogCase,
  type CaseTier,
} from './caseCatalog';
import type { FreeCaseTier } from './freeCaseTiers';

const TIER_ICONS: Record<CaseTier, string> = {
  budget: 'https://cdn.casehug.com/leveling-ranks/WOOD.webp?width=64&quality=85',
  mid: 'https://cdn.casehug.com/leveling-ranks/IRON.webp?width=64&quality=85',
  premium: 'https://cdn.casehug.com/leveling-ranks/GOLD.webp?width=64&quality=85',
  elite: 'https://cdn.casehug.com/leveling-ranks/PLATINUM.webp?width=64&quality=85',
  knife: 'https://cdn.casehug.com/leveling-ranks/MYTHIC.webp?width=64&quality=85',
  glove: 'https://cdn.casehug.com/leveling-ranks/LEGEND.webp?width=64&quality=85',
};

export function pathForCaseSlug(slug: string): string {
  return `/cases/${slug.toLowerCase()}`;
}

const CASE_COVER_IMAGES: Partial<Record<string, string>> = {
  'neon-district': '/images/cases/neon-district.png',
  'arctic-ops': '/images/cases/arctic-ops.png',
  'inferno-rush': '/images/cases/inferno-rush.png',
  'shadow-vault': '/images/cases/shadow-vault.png',
  'street-cache': '/images/cases/street-cache.png',
};

export function catalogCaseToTier(item: CatalogCase): FreeCaseTier {
  return {
    level: 0,
    name: item.name,
    rankLabel: item.name.toUpperCase(),
    gradient: item.gradient,
    glow: item.glow,
    badge: item.badge,
    chest: item.chest,
    accent: item.accent,
    iconUrl: TIER_ICONS[item.tier],
    image: CASE_COVER_IMAGES[item.slug],
  };
}

export function getAdjacentCatalogSlugs(slug: string): { prev: string | null; next: string | null } {
  const idx = CASE_CATALOG.findIndex(item => item.slug === slug.toLowerCase());
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? CASE_CATALOG[idx - 1].slug : null,
    next: idx < CASE_CATALOG.length - 1 ? CASE_CATALOG[idx + 1].slug : null,
  };
}

export function getCatalogCaseIndex(slug: string): number {
  return CASE_CATALOG.findIndex(item => item.slug === slug.toLowerCase());
}

export { getCatalogCaseBySlug, CASE_CATALOG };
