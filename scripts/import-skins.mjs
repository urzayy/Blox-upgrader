import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = fs.readFileSync(path.join(__dirname, 'skins-import.txt'), 'utf8');

function parsePrice(rawPrice) {
  let s = rawPrice.trim().replace(/\s/g, '');
  if (s.includes(',')) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length === 3) return Number(parts.join(''));
    return Number(s.replace(',', '.'));
  }
  if (/^\d+\.\d{3}$/.test(s)) return Number(s.replace('.', ''));
  return Number(s);
}

function parseRarity(word) {
  const w = word.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (w.startsWith('dorad')) return 'extraordinary';
  if (w.startsWith('roj')) return 'covert';
  if (w.startsWith('ros') || w === 'pink') return 'classified';
  if (w.startsWith('morad')) return 'restricted';
  if (w.startsWith('azul')) return 'milspec';
  if (w.startsWith('gris')) return 'consumer';
  return 'classified';
}

function inferWeapon(name) {
  const n = name.toLowerCase();
  if (n.startsWith('karambit') || n.startsWith('flip') || n.startsWith('gut ')
    || n.startsWith('stiletto') || n.startsWith('butterfly') || n.startsWith('bayonet')
    || n.startsWith('skeleton')) return 'Knife';
  if (n.includes('gloves') || n.startsWith('hand wraps')) return 'Gloves';
  if (n.startsWith('awp ') || n.startsWith('awp|')) return 'AWP';
  if (n.startsWith('ssg 08')) return 'AWP';
  if (n.startsWith('case ')) return 'Case';
  if (n.startsWith('package ')) return 'Package';
  if (n.startsWith('glock') || n.startsWith('usp-s') || n.startsWith('desert eagle')
    || n.startsWith('tec-9') || n.startsWith('p250') || n.startsWith('five-seven')
    || n.startsWith('dual berettas') || n.startsWith('r8 revolver') || n.startsWith('zeus')) return 'Pistol';
  if (n.startsWith('mp9') || n.startsWith('mac-10') || n.startsWith('p90')) return 'SMG';
  return 'Rifle';
}

function slugify(name, i) {
  return `skin_${String(i + 1).padStart(3, '0')}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)}`;
}

const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
const skins = [];

for (const line of lines) {
  const urlMatch = line.match(/(https:\/\/[^\s]+)/);
  if (!urlMatch) continue;
  const url = urlMatch[1];
  const beforeUrl = line.slice(0, urlMatch.index).trim();

  const rarityMatch = beforeUrl.match(/\b(dorado|rojo|roja|rosa|morada|morado|azul|gris|pink)\s*$/i);
  if (!rarityMatch) continue;
  const rarityWord = rarityMatch[1];
  const beforeRarity = beforeUrl.slice(0, rarityMatch.index).trim();

  const priceMatch = beforeRarity.match(/([\d.,]+)\s*$/);
  if (!priceMatch) continue;
  const price = parsePrice(priceMatch[1]);
  const name = beforeRarity.slice(0, priceMatch.index).trim();

  skins.push({
    name,
    price,
    rarity: parseRarity(rarityWord),
    image: url,
    weapon: inferWeapon(name),
  });
}

skins.sort((a, b) => b.price - a.price);

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const entries = skins.map((s, i) =>
  `  { id: '${slugify(s.name, i)}', name: '${esc(s.name)}', weapon: '${s.weapon}', rarity: '${s.rarity}', wear: 'Field-Tested', price: ${s.price}, image: '${s.image}' },`,
).join('\n');

const out = `// Auto-generated catalog — ${skins.length} skins, sorted by price desc
export const BLOX_SKINS: Skin[] = [
${entries}
];
`;

fs.writeFileSync(path.join(__dirname, 'generated-catalog.txt'), out, 'utf8');

const header = `export type RarityKey =
  | 'consumer'
  | 'industrial'
  | 'milspec'
  | 'restricted'
  | 'classified'
  | 'covert'
  | 'extraordinary';

export interface Skin {
  id: string;
  name: string;
  weapon: string;
  rarity: RarityKey;
  wear: string;
  price: number;
  image: string;
}

export interface FeedItem {
  id: string;
  username: string;
  inputSkin: string;
  targetSkin: string;
  probability: number;
  won: boolean;
  timestamp: number;
}

export const RARITY: Record<RarityKey, { label: string; color: string; glow: string }> = {
  consumer: { label: 'Consumer', color: '#b0c3d9', glow: 'rgba(176,195,217,0.35)' },
  industrial: { label: 'Industrial', color: '#5e98d9', glow: 'rgba(94,152,217,0.35)' },
  milspec: { label: 'Mil-Spec', color: '#4b69ff', glow: 'rgba(75,105,255,0.4)' },
  restricted: { label: 'Restricted', color: '#8847ff', glow: 'rgba(136,71,255,0.45)' },
  classified: { label: 'Classified', color: '#d32ce6', glow: 'rgba(211,44,230,0.45)' },
  covert: { label: 'Covert', color: '#eb4b4b', glow: 'rgba(235,75,75,0.5)' },
  extraordinary: { label: 'Extraordinary', color: '#ffd700', glow: 'rgba(255,215,0,0.55)' },
};

export function sortSkinsByPriceDesc(skins: Skin[]): Skin[] {
  return [...skins].sort((a, b) => b.price - a.price);
}

`;

const catalog = out
  .replace('export const BLOX_SKINS', 'const SKIN_CATALOG')
  .replace('// Auto-generated catalog', '/** Bloxstrike catalog — sorted by price desc */');

const footer = `
export const STARTER_INVENTORY: Skin[] = [];
export const TARGET_POOL: Skin[] = SKIN_CATALOG;
export const INVENTORY: Skin[] = [];
export const ALL_SKINS_CATALOG: Skin[] = SKIN_CATALOG;

export const FEED_USERS = [
  'NeonPulse', 'xKiller99', 'VortexAce', 'CyberWolf', 'BladeRunner',
  'GhostOps', 'TitanSlayer', 'NovaStrike', 'IronFist', 'DarkMatter',
];

export const USER = {
  username: 'ShadowViper',
  balance: 2847.5,
  inventoryValue: 12450,
};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/skins.ts'), header + catalog + footer, 'utf8');
console.log('Wrote src/data/skins.ts');
