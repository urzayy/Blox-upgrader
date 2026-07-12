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
  'edge-protocol': '/Caja1.png',
  'striker-knife': '/Caja2.png',
  'sport-palm': '/Caja4.png',
  'blade-roulette': '/Caja3.png',
  'operator-wrap': '/Caja5.png',
  'chrome-factory': '/HighRisk1.png',
  'violet-storm': '/HighRisk2.png',
  'ember-core': '/HighRisk3.png',
  'toxic-alley': '/HighRisk4.png',
  'midnight-run': '/HighRisk5.png',
  'gold-reserve': '/LowRisk1.png?v=2',
  'ruby-raid': '/LowRisk2.png?v=2',
  'sapphire-code': '/LowRisk3.png?v=2',
  'phantom-grid': '/LowRisk4.png?v=2',
  'riot-zone': '/LowRisk5.png?v=2',
  'cutlass-box': '/Battles1.png?v=1',
  'kings-gambit': '/Battles2.png?v=1',
  'apex-cache': '/Battles3.png?v=1',
  'driver-lane': '/Battles4.png?v=1',
  'hand-wraps-box': '/Battles5.png?v=1',
  'sharpened': '/Mixed1.png?v=1',
  'mystery-hex': '/Mixed2.png?v=1',
  'night-market': '/Mixed3.png?v=1',
  'covert-reactor': '/Mixed4.png?v=1',
  'overdrive': '/Mixed5.png?v=1',
  'classified-hub': '/Mixed6.png?v=1',
};

const CASE_IMAGE_META: Partial<Record<string, Pick<FreeCaseTier, 'imageScale'>>> = {
  'gold-reserve': { imageScale: 1.28 },
  'ruby-raid': { imageScale: 1.28 },
  'sapphire-code': { imageScale: 1.28 },
  'phantom-grid': { imageScale: 1.28 },
  'riot-zone': { imageScale: 1.28 },
  'cutlass-box': { imageScale: 1.28 },
  'kings-gambit': { imageScale: 1.28 },
  'apex-cache': { imageScale: 1.28 },
  'driver-lane': { imageScale: 1.28 },
  'hand-wraps-box': { imageScale: 1.28 },
  'sharpened': { imageScale: 1.28 },
  'mystery-hex': { imageScale: 1.28 },
  'night-market': { imageScale: 1.28 },
  'covert-reactor': { imageScale: 1.28 },
  'overdrive': { imageScale: 1.28 },
  'classified-hub': { imageScale: 1.28 },
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
    ...CASE_IMAGE_META[item.slug],
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
