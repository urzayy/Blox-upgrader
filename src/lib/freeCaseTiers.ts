export interface FreeCaseTier {
  level: number;
  name: string;
  /** Rank label shown on the case opener (e.g. WOOD for Bronze). */
  rankLabel?: string;
  gradient: string;
  glow: string;
  badge: string;
  chest: string;
  accent: string;
  image?: string;
  imageBlend?: 'lighten' | 'screen';
  imageScale?: number;
  iconUrl: string;
}

export const FREE_CASE_TIERS: FreeCaseTier[] = [
  { level: 2, name: 'Bronze', rankLabel: 'WOOD', iconUrl: 'https://cdn.casehug.com/leveling-ranks/WOOD.webp?width=64&quality=85', gradient: 'from-[#3d2514] via-[#5a3418] to-[#8b4518]', glow: 'rgba(217,119,6,0.32)', badge: 'from-amber-600 to-amber-900', chest: '#B87333', accent: '#E8943A', image: '/images/free-cases/bronze-chest.png?v=9' },
  { level: 7, name: 'Iron', iconUrl: 'https://cdn.casehug.com/leveling-ranks/IRON.webp?width=64&quality=85', gradient: 'from-[#2a3344] via-[#151a24] to-[#1e2430]', glow: 'rgba(148,163,184,0.3)', badge: 'from-slate-500 to-slate-700', chest: '#64748B', accent: '#94A3B8', image: '/images/free-cases/iron-vault.png?v=2' },
  { level: 12, name: 'Copper', iconUrl: 'https://cdn.casehug.com/leveling-ranks/BRONZE.webp?width=128&quality=85', gradient: 'from-[#3d2a14] via-[#5a3a18] to-[#8b5a28]', glow: 'rgba(205,127,50,0.32)', badge: 'from-orange-700 to-amber-900', chest: '#B45309', accent: '#F59E0B', image: '/images/free-cases/copper-treasure.png?v=2' },
  { level: 20, name: 'Silver', iconUrl: 'https://cdn.casehug.com/leveling-ranks/SILVER.webp?width=64&quality=85', gradient: 'from-[#2a3348] via-[#3d4a5c] to-[#6b7d94]', glow: 'rgba(203,213,225,0.28)', badge: 'from-slate-300 to-slate-500', chest: '#CBD5E1', accent: '#E2E8F0', image: '/images/free-cases/silver-case.png?v=2' },
  { level: 28, name: 'Gold', iconUrl: 'https://cdn.casehug.com/leveling-ranks/GOLD.webp?width=64&quality=85', gradient: 'from-[#3d3410] via-[#5a4a18] to-[#8b7a28]', glow: 'rgba(250,204,21,0.38)', badge: 'from-yellow-500 to-amber-600', chest: '#EAB308', accent: '#FDE047', image: '/images/free-cases/gold-chest-v2.png?v=1' },
  { level: 35, name: 'Platinum', iconUrl: 'https://cdn.casehug.com/leveling-ranks/PLATINUM.webp?width=64&quality=85', gradient: 'from-[#1e3a5f] via-[#2a5080] to-[#4a7ab0]', glow: 'rgba(125,211,252,0.28)', badge: 'from-sky-300 to-blue-500', chest: '#7DD3FC', accent: '#BAE6FD', image: '/images/free-cases/platinum-treasure.png?v=2' },
  { level: 41, name: 'Emerald', iconUrl: 'https://cdn.casehug.com/leveling-ranks/EMERALD.webp?width=64&quality=85', gradient: 'from-[#0f3328] via-[#1a4a38] to-[#2d7a58]', glow: 'rgba(52,211,153,0.32)', badge: 'from-emerald-500 to-green-700', chest: '#10B981', accent: '#6EE7B7', image: '/images/free-cases/emerald-treasure.png?v=1' },
  { level: 50, name: 'Ruby', iconUrl: 'https://cdn.casehug.com/leveling-ranks/LEGEND.webp?width=64&quality=85', gradient: 'from-[#3d1020] via-[#5a1830] to-[#8b2848]', glow: 'rgba(244,63,94,0.32)', badge: 'from-rose-500 to-red-700', chest: '#F43F5E', accent: '#FB7185', image: '/images/free-cases/ruby-treasure.png?v=1' },
  { level: 58, name: 'Sapphire', iconUrl: 'https://cdn.casehug.com/leveling-ranks/CHALLENGER.webp?width=64&quality=85', gradient: 'from-[#10204a] via-[#1a3060] to-[#2a4880]', glow: 'rgba(59,130,246,0.32)', badge: 'from-blue-500 to-indigo-700', chest: '#3B82F6', accent: '#60A5FA', image: '/images/free-cases/sapphire-treasure.png?v=1' },
  { level: 66, name: 'Diamond', iconUrl: 'https://cdn.casehug.com/leveling-ranks/DIAMOND.webp?width=64&quality=85', gradient: 'from-[#2a1848] via-[#3d2860] to-[#5a4080]', glow: 'rgba(168,85,247,0.35)', badge: 'from-violet-400 to-purple-600', chest: '#A855F7', accent: '#D8B4FE', image: '/images/free-cases/diamond-treasure.png?v=1' },
  { level: 77, name: 'Master', iconUrl: 'https://cdn.casehug.com/leveling-ranks/MYTHIC.webp?width=64&quality=85', gradient: 'from-[#3d1040] via-[#5a1860] to-[#8b2880]', glow: 'rgba(236,72,153,0.42)', badge: 'from-fuchsia-500 to-purple-800', chest: '#EC4899', accent: '#F9A8D4', image: '/images/free-cases/master-treasure.png?v=1' },
  { level: 90, name: 'Challenger', iconUrl: 'https://cdn.casehug.com/leveling-ranks/IMMORTAL.webp?width=64&quality=85', gradient: 'from-[#4a1018] via-[#6a1828] to-[#9a2840]', glow: 'rgba(244,63,94,0.38)', badge: 'from-rose-500 to-red-800', chest: '#EF4444', accent: '#FCA5A5', image: '/images/free-cases/challenger-treasure.png?v=1' },
];

export function slugForTier(tier: FreeCaseTier): string {
  return `${tier.name.toLowerCase()}case`;
}

export function pathForFreeCaseSlug(slug: string): string {
  return `/free-cases/${slug.toLowerCase()}`;
}

export function getFreeCaseBySlug(slug: string): FreeCaseTier | undefined {
  const normalized = slug.toLowerCase();
  return FREE_CASE_TIERS.find(tier => slugForTier(tier) === normalized);
}

export function getAdjacentCaseSlugs(slug: string): { prev: string | null; next: string | null } {
  const idx = FREE_CASE_TIERS.findIndex(tier => slugForTier(tier) === slug.toLowerCase());
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? slugForTier(FREE_CASE_TIERS[idx - 1]) : null,
    next: idx < FREE_CASE_TIERS.length - 1 ? slugForTier(FREE_CASE_TIERS[idx + 1]) : null,
  };
}

export function rankLabelForTier(tier: FreeCaseTier): string {
  return tier.rankLabel ?? tier.name.toUpperCase();
}

export function getTierForPlayerLevel(level: number): FreeCaseTier {
  let matched = FREE_CASE_TIERS[0];
  for (const tier of FREE_CASE_TIERS) {
    if (level >= tier.level) matched = tier;
  }
  return matched;
}

export function profileRankIconUrl(tier: FreeCaseTier): string {
  return tier.iconUrl.includes('width=')
    ? tier.iconUrl.replace(/width=\d+/, 'width=128')
    : `${tier.iconUrl}${tier.iconUrl.includes('?') ? '&' : '?'}width=128&quality=90`;
}
