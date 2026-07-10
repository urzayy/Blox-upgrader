import type { Skin } from '../data/skins';

export function createGrantedCatalogCaseSkin(base: Skin, openedAt = Date.now()): Skin {
  return {
    ...base,
    id: `${base.id}_case_${openedAt}_${Math.random().toString(36).slice(2, 8)}`,
    obtainedAt: openedAt,
  };
}
