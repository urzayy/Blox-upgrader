import { findSkinById, type Skin } from '../data/skins';
import { CASE_CATALOG, getCatalogCaseBySlug, getCatalogCaseLoot, type CatalogCase } from './caseCatalog';
import type { FreeCaseLootItem, FreeCaseLootTable } from './freeCaseLoot';

export { CASE_CATALOG, getCatalogCaseBySlug, type CatalogCase };

function resolveLootItems(table: FreeCaseLootTable): FreeCaseLootItem[] {
  return table.entries
    .map(entry => {
      const skin = findSkinById(entry.skinId);
      if (!skin) return null;
      return { skin, chance: entry.chance };
    })
    .filter((item): item is FreeCaseLootItem => Boolean(item))
    .sort((a, b) => a.chance - b.chance);
}

export function getCaseLoot(slug: string): {
  featured: Skin | null;
  items: Skin[];
  loot: FreeCaseLootItem[];
} {
  const table = getCatalogCaseLoot(slug);
  if (!table) return { featured: null, items: [], loot: [] };

  const loot = resolveLootItems(table);
  const featured = findSkinById(table.featuredSkinId) ?? loot[loot.length - 1]?.skin ?? null;

  return {
    featured,
    items: loot.map(item => item.skin),
    loot,
  };
}

export function pickWeightedCaseSkin(slug: string): Skin | null {
  const { loot } = getCaseLoot(slug);
  if (!loot.length) return null;

  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const item of loot) {
    cumulative += item.chance;
    if (roll < cumulative) return item.skin;
  }

  return loot[loot.length - 1]?.skin ?? null;
}
