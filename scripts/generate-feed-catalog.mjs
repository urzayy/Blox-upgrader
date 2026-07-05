import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SKINS_TS = path.join(ROOT, 'src', 'data', 'skins.ts');
const OUT = path.join(ROOT, 'src', 'lib', 'feedBot.mjs');

const SKIN_RE = /\{\s*id:\s*'[^']+',\s*name:\s*'([^']+)',\s*weapon:\s*'([^']+)',\s*rarity:\s*'[^']+',\s*wear:\s*'[^']+',\s*price:\s*(\d+),\s*image:\s*'([^']+)'\s*\}/g;

const src = fs.readFileSync(SKINS_TS, 'utf8');
const catalog = [];
let match;
while ((match = SKIN_RE.exec(src)) !== null) {
  catalog.push({
    name: match[1],
    weapon: match[2],
    price: Number(match[3]),
    image: match[4],
  });
}

if (catalog.length < 100) {
  console.error(`[generate-feed-catalog] Expected full catalog, got ${catalog.length} skins`);
  process.exit(1);
}

const out = `// Auto-generated from src/data/skins.ts — do not edit by hand.
// Run: node scripts/generate-feed-catalog.mjs

export const FEED_SKIN_CATALOG = ${JSON.stringify(catalog, null, 2)};

export const FEED_WIN_RATE = 0.76;
export const FEED_STATE_VERSION = 2;

export const FEED_USERS = [
  'NeonPulse', 'xKiller99', 'VortexAce', 'CyberWolf', 'BladeRunner',
  'GhostOps', 'TitanSlayer', 'NovaStrike', 'IronFist', 'DarkMatter',
];

/** Old bot feed names mapped to real catalog skin names. */
export const LEGACY_FEED_NAME_ALIASES = {
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

export const FEED_SKIN_IMAGE_BY_NAME = new Map(FEED_SKIN_CATALOG.map(s => [s.name, s.image]));

function groupByWeapon(catalog) {
  const map = new Map();
  for (const skin of catalog) {
    const list = map.get(skin.weapon) ?? [];
    list.push(skin);
    map.set(skin.weapon, list);
  }
  return map;
}

/** Pick input/target pairs across all weapon types, including cheap (~10+) upgrades. */
export function pickFeedPair(catalog = FEED_SKIN_CATALOG) {
  const byWeapon = groupByWeapon(catalog);
  const weapons = [...byWeapon.keys()];

  for (let attempt = 0; attempt < 50; attempt++) {
    const inputWeapon = weapons[Math.floor(Math.random() * weapons.length)];
    const inputPool = byWeapon.get(inputWeapon) ?? [];

    const preferBudget = Math.random() < 0.62;
    const budgetInputs = inputPool.filter(s => s.price >= 10 && s.price <= 12_000);
    const inputCandidates = preferBudget && budgetInputs.length ? budgetInputs : inputPool;
    if (!inputCandidates.length) continue;

    const input = inputCandidates[Math.floor(Math.random() * inputCandidates.length)];

    const targetWeapon = Math.random() < 0.75
      ? weapons[Math.floor(Math.random() * weapons.length)]
      : inputWeapon;
    const targetPool = (byWeapon.get(targetWeapon) ?? []).filter(s => s.price > input.price);
    if (!targetPool.length) continue;

    const maxTargetPrice = input.price <= 500
      ? input.price * (4 + Math.random() * 35)
      : input.price * (1.15 + Math.random() * 2.5);
    const realisticTargets = targetPool.filter(s => s.price <= maxTargetPrice);
    const targetCandidates = realisticTargets.length ? realisticTargets : targetPool;
    const target = targetCandidates[Math.floor(Math.random() * targetCandidates.length)];

    return { input, target };
  }

  const sorted = [...catalog].sort((a, b) => a.price - b.price);
  const cheap = sorted.find(s => s.price >= 10) ?? sorted[0];
  const expensive = [...sorted].reverse().find(s => s.price > cheap.price) ?? sorted[sorted.length - 1];
  return { input: cheap, target: expensive };
}

export function resolveFeedImageByName(name, storedImage) {
  if (storedImage) return storedImage;
  if (!name || name.includes(' skins · ')) return undefined;
  const direct = FEED_SKIN_IMAGE_BY_NAME.get(name);
  if (direct) return direct;
  const alias = LEGACY_FEED_NAME_ALIASES[name];
  if (alias) return FEED_SKIN_IMAGE_BY_NAME.get(alias);
  return undefined;
}

export function enrichFeedItem(item) {
  return {
    ...item,
    inputImage: resolveFeedImageByName(item.inputSkin, item.inputImage),
    targetImage: resolveFeedImageByName(item.targetSkin, item.targetImage),
  };
}

export function createBotFeedItem({
  catalog = FEED_SKIN_CATALOG,
  users = FEED_USERS,
  winRate = FEED_WIN_RATE,
} = {}) {
  const { input, target } = pickFeedPair(catalog);
  const won = Math.random() < winRate;

  let probability;
  if (won) {
    probability = Math.round((32 + Math.random() * 38) * 10) / 10;
  } else {
    const fair = input.price > 0 && target.price > input.price
      ? (input.price / target.price) * 100
      : 0;
    const withVariance = fair > 0 ? fair + Math.random() * 12 : Math.random() * 22 + 4;
    probability = Math.min(Math.round(withVariance * 10) / 10, 32);
  }

  return {
    id: \`f_\${Date.now()}_\${Math.random().toString(36).slice(2, 6)}\`,
    username: users[Math.floor(Math.random() * users.length)],
    inputSkin: input.name,
    targetSkin: target.name,
    inputImage: input.image,
    targetImage: target.image,
    probability,
    won,
    timestamp: Date.now(),
  };
}
`;

fs.writeFileSync(OUT, out, 'utf8');
console.log(`[generate-feed-catalog] Wrote ${catalog.length} skins to ${path.relative(ROOT, OUT)}`);
