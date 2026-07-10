import { ALL_SKINS_CATALOG, findSkinById, sortSkinsByPriceDesc, type Skin } from '../data/skins';
import { getCatalogCaseLoot } from './caseCatalog';
import { getFreeCaseBySlug, type FreeCaseTier } from './freeCaseTiers';

export interface FreeCaseLootEntry {
  skinId: string;
  /** Drop chance in percent (0–100). All entries in a case should sum to 100. */
  chance: number;
}

export interface FreeCaseLootTable {
  featuredSkinId: string;
  entries: FreeCaseLootEntry[];
}

export interface FreeCaseLootItem {
  skin: Skin;
  chance: number;
}

/** Hand-crafted loot tables — add more cases here as they are designed. */
const CUSTOM_LOOT: Record<string, FreeCaseLootTable> = {
  bronzecase: {
    featuredSkinId: 'skin_204_desert_eagle_mercy',
    entries: [
      { skinId: 'skin_204_desert_eagle_mercy', chance: 0.05 },
      { skinId: 'skin_217_five_seven_x_ray', chance: 0.1 },
      { skinId: 'skin_231_desert_eagle_paranoia', chance: 24.7 },
      { skinId: 'skin_221_five_seven_icecap', chance: 1 },
      { skinId: 'skin_250_glock_18_broken_tv', chance: 74.15 },
    ],
  },
  ironcase: {
    featuredSkinId: 'skin_179_m4a1_s_orchids',
    entries: [
      { skinId: 'skin_179_m4a1_s_orchids', chance: 1 },
      { skinId: 'skin_213_galil_ar_monochrome', chance: 19 },
      { skinId: 'skin_221_five_seven_icecap', chance: 30 },
      { skinId: 'skin_242_dual_berettas_tension', chance: 50 },
    ],
  },
  coppercase: {
    featuredSkinId: 'skin_156_desert_eagle_high_octane',
    entries: [
      { skinId: 'skin_156_desert_eagle_high_octane', chance: 0.5 },
      { skinId: 'skin_160_ak_47_luminex', chance: 0.5 },
      { skinId: 'skin_206_m4a1_s_castroil', chance: 1 },
      { skinId: 'skin_178_sawed_off_supersoaked', chance: 2 },
      { skinId: 'skin_218_glock_18_fuji', chance: 46 },
      { skinId: 'skin_229_p250_glacial', chance: 50 },
    ],
  },
  silvercase: {
    featuredSkinId: 'skin_145_m4a1_s_anodized_red',
    entries: [
      { skinId: 'skin_145_m4a1_s_anodized_red', chance: 0.1 },
      { skinId: 'skin_153_glock_18_aurora', chance: 0.9 },
      { skinId: 'skin_184_desert_eagle_permafrost', chance: 9 },
      { skinId: 'skin_200_m4a4_ignition', chance: 10 },
      { skinId: 'skin_207_mac_10_midas', chance: 10 },
      { skinId: 'skin_222_mp9_choke_oil', chance: 70 },
    ],
  },
  goldcase: {
    featuredSkinId: 'skin_129_gut_whiteout',
    entries: [
      { skinId: 'skin_129_gut_whiteout', chance: 0.1 },
      { skinId: 'skin_145_m4a1_s_anodized_red', chance: 0.2 },
      { skinId: 'skin_158_ak_47_sakura', chance: 0.7 },
      { skinId: 'skin_159_awp_tekko', chance: 2 },
      { skinId: 'skin_164_m4a1_s_supersoaked', chance: 2 },
      { skinId: 'skin_177_m4a1_s_retro', chance: 5 },
      { skinId: 'skin_180_glock_18_pinpoint', chance: 10 },
      { skinId: 'skin_192_glock_18_midas', chance: 10 },
      { skinId: 'skin_215_desert_eagle_circuit', chance: 20 },
      { skinId: 'skin_225_sawed_off_improvised', chance: 50 },
    ],
  },
  platinumcase: {
    featuredSkinId: 'skin_132_hand_wraps_snakeskin',
    entries: [
      { skinId: 'skin_132_hand_wraps_snakeskin', chance: 1 },
      { skinId: 'skin_144_hand_wraps_carpet', chance: 2 },
      { skinId: 'skin_151_awp_high_octane', chance: 2 },
      { skinId: 'skin_176_package_mac_10_midas', chance: 20 },
      { skinId: 'skin_180_glock_18_pinpoint', chance: 15 },
      { skinId: 'skin_214_ssg_08_racer8', chance: 60 },
    ],
  },
  rubycase: {
    featuredSkinId: 'skin_108_driver_gloves_cardinal_weave',
    entries: [
      { skinId: 'skin_108_driver_gloves_cardinal_weave', chance: 2 },
      { skinId: 'skin_117_gut_vanilla', chance: 3 },
      { skinId: 'skin_137_gut_safari', chance: 5 },
      { skinId: 'skin_156_desert_eagle_high_octane', chance: 10 },
      { skinId: 'skin_157_m4a1_s_phaseprint', chance: 30 },
      { skinId: 'skin_188_galil_ar_irid', chance: 50 },
    ],
  },
  sapphirecase: {
    featuredSkinId: 'skin_077_butterfly_naval',
    entries: [
      { skinId: 'skin_077_butterfly_naval', chance: 1 },
      { skinId: 'skin_085_butterfly_safari', chance: 1 },
      { skinId: 'skin_111_flip_whiteout', chance: 1 },
      { skinId: 'skin_120_skeleton_woodland', chance: 1 },
      { skinId: 'skin_143_hand_wraps_hunter', chance: 6 },
      { skinId: 'skin_169_usp_s_tekko', chance: 40 },
      { skinId: 'skin_233_ak_47_red_baron', chance: 50 },
    ],
  },
  diamondcase: {
    featuredSkinId: 'skin_034_skeleton_scarlet',
    entries: [
      { skinId: 'skin_034_skeleton_scarlet', chance: 1 },
      { skinId: 'skin_142_gut_woodland', chance: 49 },
      { skinId: 'skin_234_aug_hot_rod', chance: 50 },
    ],
  },
  mastercase: {
    featuredSkinId: 'skin_009_karambit_fade',
    entries: [
      { skinId: 'skin_009_karambit_fade', chance: 0.1 },
      { skinId: 'skin_010_karambit_tiger_stripes', chance: 0.1 },
      { skinId: 'skin_012_butterfly_fade', chance: 0.1 },
      { skinId: 'skin_013_butterfly_tiger_stripes', chance: 0.1 },
      { skinId: 'skin_019_karambit_scarlet', chance: 0.1 },
      { skinId: 'skin_049_karambit_midnight', chance: 0.5 },
      { skinId: 'skin_079_skeleton_blackwidow', chance: 1 },
      { skinId: 'skin_108_driver_gloves_cardinal_weave', chance: 3 },
      { skinId: 'skin_124_gut_doodle', chance: 5 },
      { skinId: 'skin_155_package_ak_47_pinpoint', chance: 10 },
      { skinId: 'skin_156_desert_eagle_high_octane', chance: 20 },
      { skinId: 'skin_203_p90_drft', chance: 60 },
    ],
  },
  challengercase: {
    featuredSkinId: 'skin_009_karambit_fade',
    entries: [
      { skinId: 'skin_009_karambit_fade', chance: 0.5 },
      { skinId: 'skin_014_bayonet_fade', chance: 0.5 },
      { skinId: 'skin_015_sports_gloves_imperial', chance: 0.5 },
      { skinId: 'skin_016_bayonet_tiger_stripes', chance: 0.5 },
      { skinId: 'skin_017_sports_gloves_malibu', chance: 0.5 },
      { skinId: 'skin_042_butterfly_rusted', chance: 2.5 },
      { skinId: 'skin_073_butterfly_violet', chance: 5 },
      { skinId: 'skin_091_flip_blackwidow', chance: 10 },
      { skinId: 'skin_099_gut_damascus', chance: 15 },
      { skinId: 'skin_115_flip_woodland', chance: 15 },
      { skinId: 'skin_140_gut_rusted', chance: 25 },
      { skinId: 'skin_144_hand_wraps_carpet', chance: 25 },
    ],
  },
};

function playableSkins(): Skin[] {
  return ALL_SKINS_CATALOG.filter(
    s => s.weapon !== 'Package' && s.weapon !== 'Knife' && s.weapon !== 'Case',
  );
}

function autoLootForTier(tier: FreeCaseTier): FreeCaseLootTable {
  const maxPrice = Math.max(8, Math.round(tier.level * 2.8));
  const pool = sortSkinsByPriceDesc(
    playableSkins().filter(s => s.price <= maxPrice),
  );

  const picked: Skin[] = [];
  const seen = new Set<string>();
  for (const skin of pool) {
    if (seen.has(skin.id)) continue;
    seen.add(skin.id);
    picked.push(skin);
    if (picked.length >= 14) break;
  }

  const featured =
    picked.find(s => s.rarity === 'classified' || s.rarity === 'restricted')
    ?? picked[0]
    ?? playableSkins()[0];

  const equalChance = picked.length ? 100 / picked.length : 0;

  return {
    featuredSkinId: featured.id,
    entries: picked.map(s => ({ skinId: s.id, chance: equalChance })),
  };
}

function resolveLootTable(slug: string): FreeCaseLootTable {
  const catalog = getCatalogCaseLoot(slug);
  if (catalog) return catalog;

  const custom = CUSTOM_LOOT[slug];
  if (custom) return custom;

  const tier = getFreeCaseBySlug(slug);
  if (!tier) return { featuredSkinId: '', entries: [] };
  return autoLootForTier(tier);
}

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

export function getFreeCaseLoot(slug: string): {
  featured: Skin | null;
  items: Skin[];
  loot: FreeCaseLootItem[];
} {
  const table = resolveLootTable(slug);
  const loot = resolveLootItems(table);
  const featured = findSkinById(table.featuredSkinId) ?? loot[0]?.skin ?? null;

  return {
    featured,
    items: loot.map(item => item.skin),
    loot,
  };
}

export function pickWeightedFreeCaseSkin(slug: string): Skin | null {
  const { loot } = getFreeCaseLoot(slug);
  return pickWeightedFromLoot(loot);
}

export const JOKER_CASE_PRICE = 355;

const CASE_JOKER_PRICE_OVERRIDES: Record<string, number> = {
  'inferno-rush': 895,
};

export function getJokerCasePrice(slug: string): number {
  return CASE_JOKER_PRICE_OVERRIDES[slug] ?? JOKER_CASE_PRICE;
}

export function toEqualChanceLoot(loot: FreeCaseLootItem[]): FreeCaseLootItem[] {
  if (!loot.length) return [];
  const chance = 100 / loot.length;
  return loot.map(item => ({ ...item, chance }));
}

export function pickWeightedFromLoot(loot: FreeCaseLootItem[]): Skin | null {
  if (!loot.length) return null;

  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const item of loot) {
    cumulative += item.chance;
    if (roll < cumulative) return item.skin;
  }

  return loot[loot.length - 1]?.skin ?? null;
}

export function formatLootChance(chance: number): string {
  if (chance >= 1) return `${chance.toFixed(chance % 1 === 0 ? 0 : 2)}%`;
  if (chance >= 0.1) return `${chance.toFixed(2)}%`;
  return `${chance.toFixed(2)}%`;
}

export { isRoyalLootChance } from './freeCaseRoyal';

/** Skins at or above this drop chance use the common landing sound. */
export const COMMON_DROP_SOUND_MIN_CHANCE = 5.1;
/** Skins between 1.01% and 5% use the mid-tier landing sound. */
export const MID_DROP_SOUND_MIN_CHANCE = 1.01;
export const MID_DROP_SOUND_MAX_CHANCE = 5;

export type FreeCaseDropSound = 'common' | 'mid' | 'none';

export function getLootChanceForSkin(slug: string, skinId: string): number | null {
  const { loot } = getFreeCaseLoot(slug);
  const item = loot.find(entry => entry.skin.id === skinId);
  return item?.chance ?? null;
}

export function getFreeCaseDropSound(slug: string, skinId: string): FreeCaseDropSound {
  const chance = getLootChanceForSkin(slug, skinId);
  if (chance == null) return 'common';
  if (chance >= COMMON_DROP_SOUND_MIN_CHANCE) return 'common';
  if (chance >= MID_DROP_SOUND_MIN_CHANCE && chance <= MID_DROP_SOUND_MAX_CHANCE) return 'mid';
  return 'none';
}

export function usesCommonDropSound(slug: string, skinId: string): boolean {
  return getFreeCaseDropSound(slug, skinId) === 'common';
}

export function hasCustomLoot(slug: string): boolean {
  return slug in CUSTOM_LOOT;
}
