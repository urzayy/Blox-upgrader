/**
 * Builds src/lib/curatedCaseConfig.ts from transcript-extracted data.
 * Run: node scripts/build-curated-config.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const base = JSON.parse(
  fs.readFileSync(path.join(root, 'scripts/curated-cases-extracted.json'), 'utf8'),
);

const extra = {
  'cutlass-box': {
    price: 20,
    loot: {
      featuredSkinId: 'skin_158_ak_47_sakura',
      entries: [
        { skinId: 'skin_158_ak_47_sakura', chance: 0.5 },
        { skinId: 'skin_159_awp_tekko', chance: 0.5 },
        { skinId: 'skin_192_glock_18_midas', chance: 9 },
        { skinId: 'skin_209_desert_eagle_racer8', chance: 55 },
        { skinId: 'skin_247_galil_ar_feral', chance: 35 },
      ],
    },
  },
  'kings-gambit': {
    price: 75,
    loot: {
      featuredSkinId: 'skin_145_m4a1_s_anodized_red',
      entries: [
        { skinId: 'skin_145_m4a1_s_anodized_red', chance: 1 },
        { skinId: 'skin_169_usp_s_tekko', chance: 4 },
        { skinId: 'skin_180_glock_18_pinpoint', chance: 5 },
        { skinId: 'skin_184_desert_eagle_permafrost', chance: 50 },
        { skinId: 'skin_260_mp9_paranoia', chance: 40 },
      ],
    },
  },
  'apex-cache': {
    price: 200,
    loot: {
      featuredSkinId: 'skin_137_gut_safari',
      entries: [
        { skinId: 'skin_137_gut_safari', chance: 1 },
        { skinId: 'skin_144_hand_wraps_carpet', chance: 1 },
        { skinId: 'skin_153_glock_18_aurora', chance: 3 },
        { skinId: 'skin_161_awp_overdrive', chance: 5 },
        { skinId: 'skin_176_package_mac_10_midas', chance: 50 },
        { skinId: 'skin_247_galil_ar_feral', chance: 40 },
      ],
    },
  },
  'driver-lane': {
    price: 350,
    loot: {
      featuredSkinId: 'skin_052_driver_gloves_snow_leopard',
      entries: [
        { skinId: 'skin_052_driver_gloves_snow_leopard', chance: 1 },
        { skinId: 'skin_079_skeleton_blackwidow', chance: 1 },
        { skinId: 'skin_081_butterfly_midnight', chance: 1 },
        { skinId: 'skin_138_hand_wraps_camouflage', chance: 2 },
        { skinId: 'skin_158_ak_47_sakura', chance: 5 },
        { skinId: 'skin_174_mp9_high_octane', chance: 50 },
        { skinId: 'skin_268_p250_b_250', chance: 40 },
      ],
    },
  },
  'hand-wraps-box': {
    price: 500,
    loot: {
      featuredSkinId: 'skin_041_stiletto_blackwidow',
      entries: [
        { skinId: 'skin_041_stiletto_blackwidow', chance: 1 },
        { skinId: 'skin_067_bayonet_naval', chance: 1 },
        { skinId: 'skin_113_stiletto_rusted', chance: 3 },
        { skinId: 'skin_134_operator_gloves_hunter', chance: 5 },
        { skinId: 'skin_153_glock_18_aurora', chance: 30 },
        { skinId: 'skin_156_desert_eagle_high_octane', chance: 20 },
        { skinId: 'skin_272_p90_big_cat', chance: 40 },
      ],
    },
  },
  sharpened: {
    price: 70,
    loot: {
      featuredSkinId: 'skin_067_bayonet_naval',
      entries: [
        { skinId: 'skin_067_bayonet_naval', chance: 0.02 },
        { skinId: 'skin_158_ak_47_sakura', chance: 0.067 },
        { skinId: 'skin_153_glock_18_aurora', chance: 0.05 },
        { skinId: 'skin_177_m4a1_s_retro', chance: 0.17 },
        { skinId: 'skin_183_mp9_x_ray', chance: 4 },
        { skinId: 'skin_181_m4a4_b_hop', chance: 3 },
        { skinId: 'skin_179_m4a1_s_orchids', chance: 2 },
        { skinId: 'skin_178_sawed_off_supersoaked', chance: 2 },
        { skinId: 'skin_184_desert_eagle_permafrost', chance: 15 },
        { skinId: 'skin_186_famas_mind', chance: 17 },
        { skinId: 'skin_185_awp_typhon', chance: 25 },
        { skinId: 'skin_210_dual_berettas_choking_hazard', chance: 31.693 },
      ],
    },
  },
  'mystery-hex': {
    price: 199,
    loot: {
      featuredSkinId: 'skin_075_bayonet_doodle',
      entries: [
        { skinId: 'skin_075_bayonet_doodle', chance: 0.1 },
        { skinId: 'skin_077_butterfly_naval', chance: 0.1 },
        { skinId: 'skin_078_butterfly_woodland', chance: 0.1 },
        { skinId: 'skin_088_skeleton_naval', chance: 0.2 },
        { skinId: 'skin_121_flip_violet', chance: 0.5 },
        { skinId: 'skin_151_awp_high_octane', chance: 2 },
        { skinId: 'skin_153_glock_18_aurora', chance: 7 },
        { skinId: 'skin_160_ak_47_luminex', chance: 10 },
        { skinId: 'skin_161_awp_overdrive', chance: 10 },
        { skinId: 'skin_163_ak_47_midas', chance: 10 },
        { skinId: 'skin_177_m4a1_s_retro', chance: 5 },
        { skinId: 'skin_178_sawed_off_supersoaked', chance: 15 },
        { skinId: 'skin_180_glock_18_pinpoint', chance: 10 },
        { skinId: 'skin_182_p90_pinpoint', chance: 10 },
        { skinId: 'skin_183_mp9_x_ray', chance: 5 },
        { skinId: 'skin_184_desert_eagle_permafrost', chance: 5 },
        { skinId: 'skin_186_famas_mind', chance: 5 },
        { skinId: 'skin_188_galil_ar_irid', chance: 5 },
      ],
    },
  },
  'night-market': {
    price: 325,
    loot: {
      featuredSkinId: 'skin_120_skeleton_woodland',
      entries: [
        { skinId: 'skin_120_skeleton_woodland', chance: 0.2 },
        { skinId: 'skin_119_package_desert_eagle_high_octane', chance: 0.2 },
        { skinId: 'skin_126_gut_blackwidow', chance: 0.2 },
        { skinId: 'skin_128_driver_gloves_gator', chance: 0.2 },
        { skinId: 'skin_127_gut_violet', chance: 0.2 },
        { skinId: 'skin_145_m4a1_s_anodized_red', chance: 1 },
        { skinId: 'skin_153_glock_18_aurora', chance: 1 },
        { skinId: 'skin_154_package_usp_s_tekko', chance: 2 },
        { skinId: 'skin_156_desert_eagle_high_octane', chance: 5 },
        { skinId: 'skin_158_ak_47_sakura', chance: 15 },
        { skinId: 'skin_160_ak_47_luminex', chance: 10 },
        { skinId: 'skin_169_usp_s_tekko', chance: 5 },
        { skinId: 'skin_157_m4a1_s_phaseprint', chance: 20 },
        { skinId: 'skin_174_mp9_high_octane', chance: 9 },
        { skinId: 'skin_175_usp_s_supersoaked', chance: 11 },
        { skinId: 'skin_183_mp9_x_ray', chance: 8 },
        { skinId: 'skin_185_awp_typhon', chance: 12 },
      ],
    },
  },
  'covert-reactor': {
    price: 800,
    loot: {
      featuredSkinId: 'skin_035_sports_gloves_labyrinth',
      entries: [
        { skinId: 'skin_035_sports_gloves_labyrinth', chance: 0.2 },
        { skinId: 'skin_036_karambit_violet', chance: 0.2 },
        { skinId: 'skin_037_operator_gloves_hellwire', chance: 0.2 },
        { skinId: 'skin_038_sports_gloves_racer', chance: 0.2 },
        { skinId: 'skin_039_awp_beta', chance: 0.2 },
        { skinId: 'skin_079_skeleton_blackwidow', chance: 0.5 },
        { skinId: 'skin_081_butterfly_midnight', chance: 0.5 },
        { skinId: 'skin_113_stiletto_rusted', chance: 3 },
        { skinId: 'skin_133_gut_midnight', chance: 5 },
        { skinId: 'skin_142_gut_woodland', chance: 5 },
        { skinId: 'skin_145_m4a1_s_anodized_red', chance: 10 },
        { skinId: 'skin_150_package_awp_tekko', chance: 8 },
        { skinId: 'skin_152_package_m4a4_tekko', chance: 7 },
        { skinId: 'skin_153_glock_18_aurora', chance: 20 },
        { skinId: 'skin_156_desert_eagle_high_octane', chance: 10 },
        { skinId: 'skin_158_ak_47_sakura', chance: 5 },
        { skinId: 'skin_159_awp_tekko', chance: 5 },
        { skinId: 'skin_157_m4a1_s_phaseprint', chance: 5 },
        { skinId: 'skin_183_mp9_x_ray', chance: 10 },
        { skinId: 'skin_184_desert_eagle_permafrost', chance: 10 },
      ],
    },
  },
  overdrive: {
    price: 1250,
    loot: {
      featuredSkinId: 'skin_019_karambit_scarlet',
      entries: [
        { skinId: 'skin_019_karambit_scarlet', chance: 0.1 },
        { skinId: 'skin_034_skeleton_scarlet', chance: 0.4 },
        { skinId: 'skin_044_flip_scarlet', chance: 1.5 },
        { skinId: 'skin_052_driver_gloves_snow_leopard', chance: 3 },
        { skinId: 'skin_080_driver_gloves_cobra', chance: 5 },
        { skinId: 'skin_116_sports_gloves_hunter', chance: 10 },
        { skinId: 'skin_127_gut_violet', chance: 10 },
        { skinId: 'skin_140_gut_rusted', chance: 12 },
        { skinId: 'skin_146_package_mp9_high_octane', chance: 8 },
        { skinId: 'skin_153_glock_18_aurora', chance: 7 },
        { skinId: 'skin_156_desert_eagle_high_octane', chance: 13 },
        { skinId: 'skin_158_ak_47_sakura', chance: 10 },
        { skinId: 'skin_159_awp_tekko', chance: 10 },
        { skinId: 'skin_160_ak_47_luminex', chance: 10 },
      ],
    },
  },
  'classified-hub': {
    price: 1699,
    loot: {
      featuredSkinId: 'skin_016_bayonet_tiger_stripes',
      entries: [
        { skinId: 'skin_016_bayonet_tiger_stripes', chance: 0.2 },
        { skinId: 'skin_017_sports_gloves_malibu', chance: 0.3 },
        { skinId: 'skin_018_stiletto_violet', chance: 0.5 },
        { skinId: 'skin_042_butterfly_rusted', chance: 1 },
        { skinId: 'skin_057_gut_fade', chance: 3 },
        { skinId: 'skin_079_skeleton_blackwidow', chance: 5 },
        { skinId: 'skin_089_gut_scarlet', chance: 10 },
        { skinId: 'skin_108_driver_gloves_cardinal_weave', chance: 5 },
        { skinId: 'skin_122_awp_metamorphosis', chance: 5 },
        { skinId: 'skin_137_gut_safari', chance: 10 },
        { skinId: 'skin_145_m4a1_s_anodized_red', chance: 8 },
        { skinId: 'skin_151_awp_high_octane', chance: 12 },
        { skinId: 'skin_153_glock_18_aurora', chance: 10 },
        { skinId: 'skin_155_package_ak_47_pinpoint', chance: 7 },
        { skinId: 'skin_156_desert_eagle_high_octane', chance: 8 },
        { skinId: 'skin_157_m4a1_s_phaseprint', chance: 7.5 },
        { skinId: 'skin_173_awp_bird_hunt', chance: 7.5 },
      ],
    },
  },
};

const names = {
  'edge-protocol': 'FiveSeven',
  'striker-knife': 'MIDAS',
  'sport-palm': 'Castroil',
  'blade-roulette': 'Sakura',
  'operator-wrap': 'Checkers',
  'chrome-factory': 'High Octane',
  'ember-core': 'Gloves Hunter',
  'toxic-alley': 'Knife Risk',
  'midnight-run': 'Scarlet Risk',
};

const tiers = {
  'edge-protocol': 'budget',
  'striker-knife': 'budget',
  'sport-palm': 'mid',
  'blade-roulette': 'mid',
  'chrome-factory': 'knife',
  'ember-core': 'glove',
  'toxic-alley': 'knife',
  'midnight-run': 'knife',
  'gold-reserve': 'mid',
  'ruby-raid': 'mid',
  'sapphire-code': 'mid',
};

const merged = Object.fromEntries(
  Object.entries({ ...base, ...extra }).map(([slug, data]) => [
    slug,
    {
      price: data.price,
      loot: data.loot ?? {
        featuredSkinId: data.featuredSkinId ?? '',
        entries: data.entries ?? [],
      },
    },
  ]),
);

function fmtEntry(e) {
  const chance = Number.isInteger(e.chance) ? e.chance : e.chance;
  return `        { skinId: '${e.skinId}', chance: ${chance} },`;
}

function fmtCase(slug, data) {
  const name = names[slug];
  const tier = tiers[slug];
  const lines = [
    `  '${slug}': {`,
    ...(name ? [`    name: '${name}',`] : []),
    ...(tier ? [`    tier: '${tier}',`] : []),
    `    price: ${data.price},`,
    `    loot: {`,
    `      featuredSkinId: '${data.loot.featuredSkinId}',`,
    `      entries: [`,
    ...data.loot.entries.map(fmtEntry),
    `      ],`,
    `    },`,
    `  },`,
  ];
  return lines.join('\n');
}

const slugs = Object.keys(merged).sort();

const out = `import type { FreeCaseLootTable } from './freeCaseLoot';

export type CuratedCaseTier = 'budget' | 'mid' | 'premium' | 'elite' | 'knife' | 'glove';

export interface CuratedCaseOverride {
  name?: string;
  tier?: CuratedCaseTier;
  price: number;
  loot: FreeCaseLootTable;
}

/** Hand-configured case prices and loot — survives catalog regeneration. */
export const CURATED_CASE_SLUGS = [
${slugs.map(s => `  '${s}',`).join('\n')}
] as const;

export const CURATED_CASE_OVERRIDES: Record<string, CuratedCaseOverride> = {
${slugs.map(slug => fmtCase(slug, merged[slug])).join('\n')}
};

export function applyCuratedCaseOverrides<
  T extends { slug: string; name: string; tier: CuratedCaseTier; price: number; loot: FreeCaseLootTable },
>(catalog: T[]): T[] {
  return catalog.map(item => {
    const override = CURATED_CASE_OVERRIDES[item.slug];
    if (!override) return item;
    return {
      ...item,
      ...(override.name != null ? { name: override.name } : {}),
      ...(override.tier != null ? { tier: override.tier } : {}),
      price: override.price,
      loot: override.loot,
    };
  });
}
`;

fs.writeFileSync(path.join(root, 'src/lib/curatedCaseConfig.ts'), out, 'utf8');
console.log(`Wrote curatedCaseConfig.ts with ${slugs.length} cases`);
