import { useEffect, useMemo, useState } from 'react';
import { RARITY, type RarityKey, type Skin } from '../../data/skins';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from './SkinImage';

import { LiveHelpControl } from '../support/LiveHelpControl';

const PAGE_SIZE = 18;

interface Props {
  skins: Skin[];
  selected: Skin | null;
  title?: string;
  variant?: 'classic' | 'upgrader';
  onSelect: (s: Skin) => void;
  onLiveHelp?: () => void;
  liveHelpLoading?: boolean;
}

function wearShort(wear: string): string {
  const map: Record<string, string> = {
    'Factory New': 'FN',
    'Minimal Wear': 'MW',
    'Field-Tested': 'FT',
    'Well-Worn': 'WW',
    'Battle-Scarred': 'BS',
  };
  return map[wear] ?? wear.slice(0, 2).toUpperCase();
}

export function TargetPanel({
  skins,
  selected,
  title = 'Select skin',
  variant = 'classic',
  onSelect,
  onLiveHelp,
  liveHelpLoading,
}: Props) {
  const isUpgrader = variant === 'upgrader';
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [rarity, setRarity] = useState('');
  const [weapon, setWeapon] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => skins.filter(s => {
    if (min && s.price < +min) return false;
    if (max && s.price > +max) return false;
    if (rarity && s.rarity !== rarity) return false;
    if (weapon && s.weapon !== weapon) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [skins, min, max, rarity, weapon, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [min, max, rarity, weapon, search]);

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  return (
    <section className={`flex min-h-[360px] flex-col overflow-hidden rounded-2xl border lg:min-h-[420px] ${
      isUpgrader
        ? 'border-violet-500/10 bg-[#141024]/90'
        : 'min-h-0 rounded-xl border-gold/15 bg-panel/95'
    }`}
    >
      <div className={`flex shrink-0 items-center justify-between px-4 py-3 ${
        isUpgrader
          ? 'border-b border-violet-500/10 bg-gradient-to-r from-violet-500/[0.08] to-transparent'
          : 'border-b border-white/5 px-3 py-2'
      }`}
      >
        <h2 className={`font-display font-bold uppercase tracking-wide ${
          isUpgrader ? 'text-sm text-white' : 'text-[11px] tracking-[0.12em] text-gold'
        }`}
        >
          {title}
        </h2>
        <span className="text-[10px] text-white/35">{filtered.length} disponibles</span>
      </div>

      <div className="shrink-0 border-b border-white/5 px-3 py-2">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-filter min-w-[100px] flex-1 text-[10px]"
          />
          <input type="number" placeholder="Desde" value={min} onChange={e => setMin(e.target.value)} className="input-filter w-20 text-[10px]" />
          <input type="number" placeholder="Hasta" value={max} onChange={e => setMax(e.target.value)} className="input-filter w-20 text-[10px]" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <select value={rarity} onChange={e => setRarity(e.target.value)} className="input-filter min-w-[90px] flex-1 text-[10px]">
            <option value="">Rareza</option>
            {(['restricted', 'classified', 'covert', 'extraordinary'] as RarityKey[]).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select value={weapon} onChange={e => setWeapon(e.target.value)} className="input-filter min-w-[90px] flex-1 text-[10px]">
            <option value="">Arma</option>
            {['Rifle', 'AWP', 'Pistol', 'SMG', 'Knife', 'Gloves', 'Case', 'Package'].map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] content-start items-start gap-2">
          {pageItems.map(skin => (
            <TargetSkinTile
              key={skin.id}
              skin={skin}
              selected={selected?.id === skin.id}
              greenPrice={isUpgrader}
              onSelect={() => onSelect(skin)}
            />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/5 px-3 py-2">
        <div className="flex flex-1 items-center justify-center gap-2">
          <button
            type="button"
            disabled={safePage <= 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/50 transition enabled:hover:border-white/25 enabled:hover:text-white disabled:opacity-30"
          >
            ‹
          </button>
          <span className="min-w-[4rem] text-center text-[10px] text-white/40">
            {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/50 transition enabled:hover:border-white/25 enabled:hover:text-white disabled:opacity-30"
          >
            ›
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onLiveHelp && (
            <LiveHelpControl onConfirm={onLiveHelp} loading={liveHelpLoading} />
          )}
        </div>
      </div>
    </section>
  );
}

function TargetSkinTile({
  skin,
  selected,
  greenPrice = false,
  onSelect,
}: {
  skin: Skin;
  selected: boolean;
  greenPrice?: boolean;
  onSelect: () => void;
}) {
  const r = RARITY[skin.rarity];
  const layoutId = selected ? `skin-target-${skin.id}` : undefined;

  return (
    <button
      type="button"
      onClick={onSelect}
      title={skin.name}
      className={`relative w-full self-start overflow-hidden rounded-lg border bg-[#141820] text-left transition ${
        selected
          ? 'border-gold ring-1 ring-gold/50 shadow-[0_0_18px_rgba(176,108,255,0.22)]'
          : 'border-white/10 hover:border-gold/35'
      }`}
    >
      <div className="absolute inset-x-0 top-0 z-10 h-0.5" style={{ background: r.color }} />

      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(circle at 50% 30%, ${r.color}, transparent 75%)` }}
      />

      <div className="relative flex items-start justify-between gap-1 px-1.5 pt-1.5">
        <div className="max-w-[calc(100%-28px)] rounded bg-black/70 px-1 py-0.5">
          <CoinPrice
            value={skin.price}
            iconClassName="h-2.5 w-2.5"
            textClassName={`text-[8px] font-bold font-display ${greenPrice ? 'text-win' : 'text-gold'}`}
          />
        </div>
        <span className="shrink-0 rounded bg-black/70 px-1 py-0.5 text-[8px] font-bold text-white/55">
          {wearShort(skin.wear)}
        </span>
      </div>

      <div className="relative mx-auto aspect-square w-full max-h-[84px] overflow-hidden p-1">
        <SkinImage src={skin.image} alt={skin.name} zoom={1.08} layoutId={layoutId} />
      </div>

      <div className="border-t border-white/5 bg-black/40 px-1.5 py-1.5">
        <p className="line-clamp-2 min-h-[2rem] text-[9px] font-semibold leading-tight text-white/90">
          {skin.name}
        </p>
      </div>
    </button>
  );
}
