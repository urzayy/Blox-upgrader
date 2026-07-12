/**
 * Generates src/lib/caseCatalog.ts — 50 mixed-weapon cases with varied sizes.
 * Run: node scripts/generate-case-catalog.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';

const SKINS_TS = 'src/data/skins.ts';
const OUT_FILE = 'src/lib/caseCatalog.ts';

const text = readFileSync(SKINS_TS, 'utf8');
const ALL_SKINS = [
  ...text.matchAll(
    /\{\s*id: '(skin_[^']+)',\s*name: '([^']+)',\s*weapon: '([^']+)',\s*rarity: '([^']+)',\s*wear:[^,]+,\s*price: (\d+)/g,
  ),
].map(m => ({
  id: m[1],
  name: m[2],
  weapon: m[3],
  rarity: m[4],
  price: Number(m[5]),
}));

const PLAYABLE = ALL_SKINS.filter(s => s.weapon !== 'Package' && s.weapon !== 'Case');
const GUNS = PLAYABLE.filter(s => s.weapon !== 'Knife' && s.weapon !== 'Gloves');
const KNIVES = ALL_SKINS.filter(s => s.weapon === 'Knife');
const GLOVES = ALL_SKINS.filter(s => s.weapon === 'Gloves');

const TIER_PRICE = {
  budget: { min: 0, max: 900 },
  mid: { min: 50, max: 3500 },
  premium: { min: 200, max: 12000 },
  elite: { min: 500, max: 999999 },
  knife: { min: 150, max: 999999 },
  glove: { min: 200, max: 999999 },
};

const STEEPNESS = {
  budget: 2.15,
  mid: 2.45,
  premium: 2.75,
  elite: 3.05,
  knife: 3.25,
  glove: 3.1,
};

const TIER_OPEN_PRICE = {
  budget: { min: 1.5, max: 12 },
  mid: { min: 8, max: 38 },
  premium: { min: 28, max: 95 },
  elite: { min: 65, max: 220 },
  knife: { min: 120, max: 520 },
  glove: { min: 95, max: 380 },
};

function caseOpenPrice(def) {
  const { min, max } = TIER_OPEN_PRICE[def.tier] ?? TIER_OPEN_PRICE.mid;
  const raw = min + seededUnit(`${def.slug}-open-price`) * (max - min);
  return Math.round(raw * 100) / 100;
}

function seededUnit(seed) {
  const hex = createHash('sha1').update(seed).digest('hex').slice(0, 8);
  return parseInt(hex, 16) / 0xffffffff;
}

function weaponFamily(skin) {
  return skin.name.split('|')[0].trim();
}

function inPriceRange(skin, tier) {
  const { min, max } = TIER_PRICE[tier] ?? TIER_PRICE.mid;
  return skin.price >= min && skin.price <= max;
}

function rotatePool(pool, offset) {
  if (!pool.length) return [];
  const start = offset % pool.length;
  return [...pool.slice(start), ...pool.slice(0, start)];
}

function pickMixedSkins(def) {
  const tier = def.tier;
  const count = def.itemCount;
  const seed = def.slug;
  const offset = Math.floor(seededUnit(seed) * 400);

  let gunPool = rotatePool(
    GUNS.filter(s => inPriceRange(s, tier)).sort((a, b) => b.price - a.price || a.id.localeCompare(b.id)),
    offset,
  );

  if (gunPool.length < count) {
    gunPool = rotatePool(
      GUNS.sort((a, b) => b.price - a.price || a.id.localeCompare(b.id)),
      offset,
    );
  }

  const byFamily = new Map();
  for (const skin of gunPool) {
    const family = weaponFamily(skin);
    if (!byFamily.has(family)) byFamily.set(family, []);
    byFamily.get(family).push(skin);
  }

  const families = [...byFamily.keys()];
  const minFamilies = Math.min(6, Math.max(4, Math.floor(count / 3)));
  const picked = [];
  const used = new Set();

  let round = 0;
  while (picked.length < count && round < 40) {
    const familyOrder = rotatePool(families, offset + round * 7);
    for (const family of familyOrder) {
      const list = byFamily.get(family) ?? [];
      const skin = list.find(s => !used.has(s.id));
      if (!skin) continue;
      used.add(skin.id);
      picked.push(skin);
      if (picked.length >= count) break;
    }
    round += 1;
  }

  const specialSlots =
    tier === 'knife' ? 2
    : tier === 'glove' ? 2
    : tier === 'elite' ? 1
    : tier === 'premium' && seededUnit(`${seed}-knife`) > 0.45 ? 1
    : 0;

  if (specialSlots > 0) {
    const specialPool = tier === 'glove'
      ? rotatePool(GLOVES.sort((a, b) => b.price - a.price), offset)
      : rotatePool(KNIVES.sort((a, b) => b.price - a.price), offset);

    let replaced = 0;
    for (const special of specialPool) {
      if (replaced >= specialSlots) break;
      if (used.has(special.id)) continue;
      const replaceAt = picked.length - 1 - replaced;
      if (replaceAt < minFamilies) break;
      used.delete(picked[replaceAt].id);
      picked[replaceAt] = special;
      used.add(special.id);
      replaced += 1;
    }
  }

  return picked.slice(0, count);
}

function normalizeEntries(entries) {
  const sum = entries.reduce((a, e) => a + e.chance, 0);
  const scale = 100 / sum;
  const scaled = entries.map(e => ({
    skinId: e.skinId,
    chance: Math.round(e.chance * scale * 10000) / 10000,
  }));

  for (const entry of scaled) {
    if (entry.chance > 0 && entry.chance < 0.001) entry.chance = 0.001;
  }

  const zeroIdx = scaled.findIndex(e => e.chance <= 0);
  if (zeroIdx >= 0) {
    scaled[zeroIdx].chance = 0.001;
  }

  const scaledSum = scaled.reduce((a, e) => a + e.chance, 0);
  const diff = Math.round((100 - scaledSum) * 10000) / 10000;
  if (diff !== 0) {
    const adjustIdx = scaled.length - 1;
    scaled[adjustIdx].chance = Math.round((scaled[adjustIdx].chance + diff) * 10000) / 10000;
  }

  return scaled;
}

function buildMixedLoot(skins, tier, slug) {
  if (!skins.length) return { featuredSkinId: '', entries: [] };

  const sorted = [...skins].sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
  const base = STEEPNESS[tier] ?? 2.45;
  const jitter = (seededUnit(`${slug}-curve`) - 0.5) * 0.35;
  const power = base + jitter;

  const raw = sorted.map((_, i) => Math.pow(i + 1.15, power));
  const total = raw.reduce((a, b) => a + b, 0);

  const entries = normalizeEntries(
    sorted.map((skin, i) => ({
      skinId: skin.id,
      chance: (raw[i] / total) * 100,
    })),
  );

  return {
    featuredSkinId: sorted[0].id,
    entries,
  };
}

const CASE_DEFS = [
  { slug: 'neon-district', name: 'Neon District', accent: '#EC4899', gradient: 'from-[#3d1040] via-[#5a1860] to-[#8b2880]', glow: 'rgba(236,72,153,0.4)', badge: 'from-pink-500 to-fuchsia-800', chest: '#EC4899', tier: 'mid', itemCount: 20 },
  { slug: 'arctic-ops', name: 'Arctic Ops', accent: '#7DD3FC', gradient: 'from-[#102030] via-[#183048] to-[#284868]', glow: 'rgba(125,211,252,0.35)', badge: 'from-sky-300 to-blue-600', chest: '#7DD3FC', tier: 'mid', itemCount: 20 },
  { slug: 'inferno-rush', name: 'Inferno Rush', accent: '#EF4444', gradient: 'from-[#3d1008] via-[#5a1810] to-[#8b2820]', glow: 'rgba(239,68,68,0.42)', badge: 'from-red-500 to-orange-900', chest: '#EF4444', tier: 'premium', itemCount: 13 },
  { slug: 'shadow-vault', name: 'Shadow Vault', accent: '#6366F1', gradient: 'from-[#181040] via-[#281860] to-[#402880]', glow: 'rgba(99,102,241,0.42)', badge: 'from-indigo-400 to-violet-900', chest: '#6366F1', tier: 'elite', itemCount: 24 },
  { slug: 'street-cache', name: 'Street Cache', accent: '#22D3EE', gradient: 'from-[#0c2830] via-[#143848] to-[#1e5060]', glow: 'rgba(34,211,238,0.32)', badge: 'from-cyan-400 to-sky-700', chest: '#22D3EE', tier: 'budget', itemCount: 12 },
  { slug: 'chrome-factory', name: 'Chrome Factory', accent: '#94A3B8', gradient: 'from-[#1a2030] via-[#283040] to-[#3a4558]', glow: 'rgba(148,163,184,0.35)', badge: 'from-slate-400 to-slate-700', chest: '#94A3B8', tier: 'budget', itemCount: 10 },
  { slug: 'violet-storm', name: 'Violet Storm', accent: '#A855F7', gradient: 'from-[#2a1040] via-[#3d1860] to-[#5a2880]', glow: 'rgba(168,85,247,0.35)', badge: 'from-violet-500 to-purple-800', chest: '#A855F7', tier: 'mid', itemCount: 16 },
  { slug: 'ember-core', name: 'Ember Core', accent: '#F97316', gradient: 'from-[#3d2010] via-[#5a3018] to-[#8b4828]', glow: 'rgba(249,115,22,0.35)', badge: 'from-orange-500 to-amber-800', chest: '#F97316', tier: 'mid', itemCount: 15 },
  { slug: 'toxic-alley', name: 'Toxic Alley', accent: '#84CC16', gradient: 'from-[#1a2810] via-[#283818] to-[#3d5028]', glow: 'rgba(132,204,22,0.3)', badge: 'from-lime-500 to-green-700', chest: '#84CC16', tier: 'budget', itemCount: 11 },
  { slug: 'midnight-run', name: 'Midnight Run', accent: '#1E293B', gradient: 'from-[#0a0c12] via-[#141824] to-[#1e2430]', glow: 'rgba(100,116,139,0.35)', badge: 'from-slate-600 to-slate-900', chest: '#64748B', tier: 'premium', itemCount: 19 },
  { slug: 'gold-reserve', name: 'Gold Reserve', accent: '#EAB308', gradient: 'from-[#3d3410] via-[#5a4a18] to-[#8b7a28]', glow: 'rgba(234,179,8,0.4)', badge: 'from-yellow-500 to-amber-700', chest: '#EAB308', tier: 'elite', itemCount: 22 },
  { slug: 'ruby-raid', name: 'Ruby Raid', accent: '#F43F5E', gradient: 'from-[#3d1020] via-[#5a1830] to-[#8b2848]', glow: 'rgba(244,63,94,0.4)', badge: 'from-rose-500 to-red-900', chest: '#F43F5E', tier: 'elite', itemCount: 21 },
  { slug: 'sapphire-code', name: 'Sapphire Code', accent: '#3B82F6', gradient: 'from-[#101e40] via-[#182c60] to-[#284080]', glow: 'rgba(59,130,246,0.4)', badge: 'from-blue-500 to-indigo-900', chest: '#3B82F6', tier: 'elite', itemCount: 20 },
  { slug: 'phantom-grid', name: 'Phantom Grid', accent: '#8B5CF6', gradient: 'from-[#201040] via-[#301860] to-[#482880]', glow: 'rgba(139,92,246,0.35)', badge: 'from-violet-500 to-purple-700', chest: '#8B5CF6', tier: 'premium', itemCount: 17 },
  { slug: 'riot-zone', name: 'Riot Zone', accent: '#EF4444', gradient: 'from-[#3d1010] via-[#5a1818] to-[#8b2828]', glow: 'rgba(239,68,68,0.35)', badge: 'from-red-500 to-rose-800', chest: '#EF4444', tier: 'budget', itemCount: 9 },
  { slug: 'pulse-harbor', name: 'Pulse Harbor', accent: '#06B6D4', gradient: 'from-[#0c2830] via-[#143848] to-[#1e5060]', glow: 'rgba(6,182,212,0.32)', badge: 'from-cyan-500 to-sky-800', chest: '#06B6D4', tier: 'mid', itemCount: 13 },
  { slug: 'oxide-yard', name: 'Oxide Yard', accent: '#D97706', gradient: 'from-[#3d2a10] via-[#5a4018] to-[#8b6028]', glow: 'rgba(217,119,6,0.35)', badge: 'from-amber-600 to-orange-800', chest: '#D97706', tier: 'budget', itemCount: 8 },
  { slug: 'prism-lab', name: 'Prism Lab', accent: '#C084FC', gradient: 'from-[#281040] via-[#401860] to-[#602888]', glow: 'rgba(192,132,252,0.35)', badge: 'from-purple-400 to-violet-800', chest: '#C084FC', tier: 'premium', itemCount: 23 },
  { slug: 'zero-hour', name: 'Zero Hour', accent: '#22C55E', gradient: 'from-[#0f2818] via-[#1a4030] to-[#2d6048]', glow: 'rgba(34,197,94,0.32)', badge: 'from-green-500 to-emerald-800', chest: '#22C55E', tier: 'mid', itemCount: 18 },
  { slug: 'blackout-set', name: 'Blackout Set', accent: '#475569', gradient: 'from-[#0c1018] via-[#141c28] to-[#202c3c]', glow: 'rgba(71,85,105,0.35)', badge: 'from-slate-500 to-slate-800', chest: '#475569', tier: 'premium', itemCount: 16 },
  { slug: 'horizon-case', name: 'Horizon Case', accent: '#F59E0B', gradient: 'from-[#3d2808] via-[#5a3c10] to-[#8b5c18]', glow: 'rgba(245,158,11,0.38)', badge: 'from-amber-500 to-orange-800', chest: '#F59E0B', tier: 'mid', itemCount: 20 },
  { slug: 'cobalt-drop', name: 'Cobalt Drop', accent: '#0EA5E9', gradient: 'from-[#0c2030] via-[#143850] to-[#1e5070]', glow: 'rgba(14,165,233,0.32)', badge: 'from-sky-500 to-blue-700', chest: '#0EA5E9', tier: 'budget', itemCount: 14 },
  { slug: 'jade-market', name: 'Jade Market', accent: '#10B981', gradient: 'from-[#0c2820] via-[#143830] to-[#1e5048]', glow: 'rgba(16,185,129,0.32)', badge: 'from-emerald-500 to-green-800', chest: '#10B981', tier: 'budget', itemCount: 12 },
  { slug: 'crimson-fold', name: 'Crimson Fold', accent: '#DC2626', gradient: 'from-[#3d0c10] via-[#5a1418] to-[#8b2028]', glow: 'rgba(220,38,38,0.38)', badge: 'from-red-600 to-rose-900', chest: '#DC2626', tier: 'premium', itemCount: 15 },
  { slug: 'frost-byte', name: 'Frost Byte', accent: '#38BDF8', gradient: 'from-[#0c2438] via-[#143450] to-[#1e4a68]', glow: 'rgba(56,189,248,0.32)', badge: 'from-sky-400 to-blue-700', chest: '#38BDF8', tier: 'mid', itemCount: 11 },
  { slug: 'urban-legends', name: 'Urban Legends', accent: '#FB7185', gradient: 'from-[#3d1820] via-[#5a2830] to-[#8b4048]', glow: 'rgba(251,113,133,0.35)', badge: 'from-rose-400 to-pink-800', chest: '#FB7185', tier: 'mid', itemCount: 22 },
  { slug: 'sandstorm', name: 'Sandstorm', accent: '#FBBF24', gradient: 'from-[#3d3010] via-[#5a4818] to-[#8b7028]', glow: 'rgba(251,191,36,0.38)', badge: 'from-amber-400 to-yellow-700', chest: '#FBBF24', tier: 'budget', itemCount: 10 },
  { slug: 'night-market', name: 'Night Market', accent: '#4F46E5', gradient: 'from-[#141040] via-[#201860] to-[#302880]', glow: 'rgba(79,70,229,0.38)', badge: 'from-indigo-500 to-violet-800', chest: '#4F46E5', tier: 'premium', itemCount: 26 },
  { slug: 'riot-crate', name: 'Riot Crate', accent: '#14B8A6', gradient: 'from-[#0c2828] via-[#143838] to-[#1e5050]', glow: 'rgba(20,184,166,0.32)', badge: 'from-teal-500 to-cyan-800', chest: '#14B8A6', tier: 'budget', itemCount: 15 },
  { slug: 'apex-cache', name: 'Apex Cache', accent: '#FFD700', gradient: 'from-[#3d3410] via-[#5a4a18] to-[#8b7a28]', glow: 'rgba(255,215,0,0.4)', badge: 'from-yellow-400 to-amber-700', chest: '#FFD700', tier: 'knife', itemCount: 20 },
  { slug: 'blade-roulette', name: 'Blade Roulette', accent: '#F59E0B', gradient: 'from-[#3d2808] via-[#5a3c10] to-[#8b5c18]', glow: 'rgba(245,158,11,0.4)', badge: 'from-amber-500 to-orange-800', chest: '#F59E0B', tier: 'knife', itemCount: 18 },
  { slug: 'edge-protocol', name: 'Edge Protocol', accent: '#60A5FA', gradient: 'from-[#102040] via-[#183060] to-[#284880]', glow: 'rgba(96,165,250,0.35)', badge: 'from-blue-400 to-indigo-700', chest: '#60A5FA', tier: 'knife', itemCount: 16 },
  { slug: 'striker-knife', name: 'Striker Knife', accent: '#E879F9', gradient: 'from-[#301040] via-[#481860] to-[#682888]', glow: 'rgba(232,121,249,0.38)', badge: 'from-fuchsia-400 to-purple-800', chest: '#E879F9', tier: 'knife', itemCount: 14 },
  { slug: 'cutlass-box', name: 'Cutlass Box', accent: '#34D399', gradient: 'from-[#0c2820] via-[#143830] to-[#1e5040]', glow: 'rgba(52,211,153,0.32)', badge: 'from-emerald-400 to-green-700', chest: '#34D399', tier: 'knife', itemCount: 12 },
  { slug: 'sharpened', name: 'Sharpened', accent: '#FBBF24', gradient: 'from-[#3d3010] via-[#5a4818] to-[#8b7028]', glow: 'rgba(251,191,36,0.38)', badge: 'from-amber-400 to-yellow-700', chest: '#FBBF24', tier: 'knife', itemCount: 24 },
  { slug: 'sport-palm', name: 'Sport Palm', accent: '#EF4444', gradient: 'from-[#3d1018] via-[#5a1828] to-[#8b2840]', glow: 'rgba(239,68,68,0.35)', badge: 'from-red-400 to-rose-800', chest: '#EF4444', tier: 'glove', itemCount: 17 },
  { slug: 'driver-lane', name: 'Driver Lane', accent: '#F97316', gradient: 'from-[#3d2010] via-[#5a3018] to-[#8b4828]', glow: 'rgba(249,115,22,0.35)', badge: 'from-orange-400 to-amber-800', chest: '#F97316', tier: 'glove', itemCount: 15 },
  { slug: 'operator-wrap', name: 'Operator Wrap', accent: '#22C55E', gradient: 'from-[#0f2818] via-[#1a4030] to-[#2d6048]', glow: 'rgba(34,197,94,0.32)', badge: 'from-green-400 to-emerald-800', chest: '#22C55E', tier: 'glove', itemCount: 13 },
  { slug: 'hand-wraps-box', name: 'Hand Wraps Box', accent: '#A855F7', gradient: 'from-[#2a1040] via-[#3d1860] to-[#5a2880]', glow: 'rgba(168,85,247,0.35)', badge: 'from-violet-400 to-purple-800', chest: '#A855F7', tier: 'glove', itemCount: 19 },
  { slug: 'starter-pack', name: 'Starter Pack', accent: '#5E98D9', gradient: 'from-[#101e30] via-[#182c48] to-[#284068]', glow: 'rgba(94,152,217,0.32)', badge: 'from-blue-400 to-blue-700', chest: '#5E98D9', tier: 'budget', itemCount: 9 },
  { slug: 'industrial-crate', name: 'Industrial Crate', accent: '#4B69FF', gradient: 'from-[#101840] via-[#182460] to-[#283880]', glow: 'rgba(75,105,255,0.35)', badge: 'from-blue-500 to-indigo-800', chest: '#4B69FF', tier: 'budget', itemCount: 16 },
  { slug: 'classified-hub', name: 'Classified Hub', accent: '#D32CE6', gradient: 'from-[#3d1040] via-[#5a1860] to-[#8b2880]', glow: 'rgba(211,44,230,0.38)', badge: 'from-fuchsia-500 to-purple-800', chest: '#D32CE6', tier: 'premium', itemCount: 21 },
  { slug: 'covert-reactor', name: 'Covert Reactor', accent: '#EB4B4B', gradient: 'from-[#3d1010] via-[#5a1818] to-[#8b2828]', glow: 'rgba(235,75,75,0.4)', badge: 'from-red-500 to-rose-900', chest: '#EB4B4B', tier: 'premium', itemCount: 25 },
  { slug: 'mystery-hex', name: 'Mystery Hex', accent: '#6366F1', gradient: 'from-[#181040] via-[#281860] to-[#402880]', glow: 'rgba(99,102,241,0.42)', badge: 'from-indigo-400 to-violet-900', chest: '#6366F1', tier: 'elite', itemCount: 28 },
  { slug: 'delta-force', name: 'Delta Force', accent: '#78716C', gradient: 'from-[#282420] via-[#383430] to-[#504840]', glow: 'rgba(120,113,108,0.3)', badge: 'from-stone-500 to-stone-700', chest: '#78716C', tier: 'mid', itemCount: 19 },
  { slug: 'vector-case', name: 'Vector Case', accent: '#A3E635', gradient: 'from-[#283810] via-[#405018] to-[#607028]', glow: 'rgba(163,230,53,0.3)', badge: 'from-lime-400 to-green-700', chest: '#A3E635', tier: 'budget', itemCount: 13 },
  { slug: 'overdrive', name: 'Overdrive', accent: '#F472B6', gradient: 'from-[#3d1840] via-[#5a2860] to-[#8b4080]', glow: 'rgba(244,114,182,0.4)', badge: 'from-pink-400 to-purple-800', chest: '#F472B6', tier: 'elite', itemCount: 30 },
  { slug: 'ghost-protocol', name: 'Ghost Protocol', accent: '#64748B', gradient: 'from-[#1a2030] via-[#283040] to-[#3a4558]', glow: 'rgba(100,116,139,0.3)', badge: 'from-slate-500 to-slate-700', chest: '#64748B', tier: 'mid', itemCount: 17 },
  { slug: 'wildcard', name: 'Wildcard', accent: '#EC4899', gradient: 'from-[#3d1028] via-[#5a1840] to-[#8b2860]', glow: 'rgba(236,72,153,0.35)', badge: 'from-pink-500 to-rose-800', chest: '#EC4899', tier: 'premium', itemCount: 27 },
  { slug: 'kings-gambit', name: 'Kings Gambit', accent: '#8847FF', gradient: 'from-[#201040] via-[#301860] to-[#482880]', glow: 'rgba(136,71,255,0.38)', badge: 'from-purple-500 to-violet-800', chest: '#8847FF', tier: 'elite', itemCount: 23 },
];

if (CASE_DEFS.length !== 50) {
  throw new Error(`Expected 50 cases, got ${CASE_DEFS.length}`);
}

const CASE_PRICE_OVERRIDES = {
  'neon-district': 120,
  'arctic-ops': 180,
  'inferno-rush': 265,
};

const cases = CASE_DEFS.map(def => {
  const skins = pickMixedSkins(def);
  if (skins.length < Math.min(6, def.itemCount)) {
    console.warn(`Warning: ${def.slug} only picked ${skins.length}/${def.itemCount} skins`);
  }
  const loot = buildMixedLoot(skins, def.tier, def.slug);
  const families = new Set(skins.map(weaponFamily));
  return {
    ...def,
    price: CASE_PRICE_OVERRIDES[def.slug] ?? caseOpenPrice(def),
    loot,
    familyCount: families.size,
  };
});

function fmtLoot(entries) {
  return entries
    .map(e => {
      const chance = Number.isInteger(e.chance) ? e.chance : e.chance;
      return `      { skinId: '${e.skinId}', chance: ${chance} },`;
    })
    .join('\n');
}

const file = `import type { FreeCaseLootTable } from './freeCaseLoot';
import { applyCuratedCaseOverrides } from './curatedCaseConfig';

export type CaseTier = 'budget' | 'mid' | 'premium' | 'elite' | 'knife' | 'glove';

export interface CatalogCase {
  slug: string;
  name: string;
  accent: string;
  gradient: string;
  glow: string;
  badge: string;
  chest: string;
  tier: CaseTier;
  price: number;
  loot: FreeCaseLootTable;
}

/** 50 mixed-weapon cases — curated overrides applied from curatedCaseConfig.ts */
const GENERATED_CASE_CATALOG: CatalogCase[] = [
${cases
  .map(
    c => `  {
    slug: '${c.slug}',
    name: '${c.name.replace(/'/g, "\\'")}',
    accent: '${c.accent}',
    gradient: '${c.gradient}',
    glow: '${c.glow}',
    badge: '${c.badge}',
    chest: '${c.chest}',
    tier: '${c.tier}',
    price: ${c.price},
    loot: {
      featuredSkinId: '${c.loot.featuredSkinId}',
      entries: [
${fmtLoot(c.loot.entries)}
      ],
    },
  },`,
  )
  .join('\n')}
];

export const CASE_CATALOG: CatalogCase[] = applyCuratedCaseOverrides(GENERATED_CASE_CATALOG);

export function getCatalogCaseBySlug(slug: string): CatalogCase | undefined {
  const normalized = slug.toLowerCase();
  return CASE_CATALOG.find(item => item.slug === normalized);
}

export function getCatalogCaseLoot(slug: string): FreeCaseLootTable | null {
  return getCatalogCaseBySlug(slug)?.loot ?? null;
}
`;

writeFileSync(OUT_FILE, file, 'utf8');
console.log(`Wrote ${cases.length} cases to ${OUT_FILE}`);
const counts = cases.map(c => c.loot.entries.length);
console.log(`Items: min=${Math.min(...counts)} max=${Math.max(...counts)} avg=${(counts.reduce((a,b)=>a+b,0)/counts.length).toFixed(1)}`);
for (const c of cases) {
  const sum = c.loot.entries.reduce((a, e) => a + e.chance, 0);
  const top = c.loot.entries[0]?.chance ?? 0;
  const ok = Math.abs(sum - 100) < 0.02 ? 'ok' : `BAD ${sum}`;
  console.log(`  ${c.slug}: ${c.loot.entries.length} skins, ${c.familyCount} families, top=${top}% ${ok}`);
}
