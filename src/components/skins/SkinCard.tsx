import { memo } from 'react';
import { RARITY, type Skin } from '../../data/skins';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from './SkinImage';
import { SkinLockOverlay } from './SkinLockOverlay';

interface Props {
  skin: Skin;
  selected?: boolean;
  locked?: boolean;
  lockLabel?: string;
  variant?: 'inventory' | 'target';
  layoutIdPrefix?: 'input' | 'target';
  compact?: boolean;
  onSelect: (skin: Skin) => void;
  onSell?: (skin: Skin) => void;
}

export const SkinCard = memo(function SkinCard({
  skin,
  selected,
  locked,
  lockLabel = 'Withdraw',
  variant = 'inventory',
  layoutIdPrefix,
  compact,
  onSelect,
  onSell,
}: Props) {
  const r = RARITY[skin.rarity];
  const showSell = variant === 'inventory' && !!onSell && !locked;
  const layoutId = selected && layoutIdPrefix && !locked
    ? `skin-${layoutIdPrefix}-${skin.id}`
    : undefined;

  return (
    <div
      className={`group relative aspect-[4/5] w-full overflow-hidden rounded-lg border transition-[transform,box-shadow,border-color] duration-200 ${
        locked
          ? 'border-white/10 opacity-90'
          : selected
            ? 'scale-[1.03] border-gold ring-1 ring-gold/60 shadow-gold'
            : 'border-white/10 hover:-translate-y-1 hover:scale-[1.03] hover:border-white/25'
      } ${variant === 'target' && selected && !locked ? 'shadow-gold-lg' : ''}`}
      style={{ boxShadow: selected && !locked ? `0 0 20px ${r.glow}` : undefined }}
    >
      <button
        type="button"
        disabled={locked}
        onClick={() => {
          if (locked) return;
          onSelect(skin);
        }}
        title={locked ? `${skin.name} — ${lockLabel.toLowerCase()}, bloqueada` : skin.name}
        className={`absolute inset-0 z-0 w-full text-left ${
          locked ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="absolute inset-x-0 top-0 z-10 h-0.5" style={{ background: r.color }} />

        <div
          className="absolute inset-0 opacity-25 transition-opacity group-hover:opacity-40"
          style={{ background: `radial-gradient(circle at 50% 35%, ${r.color}, transparent 72%)` }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#1c2030] via-[#141820] to-[#0c0e14]" />

        <div className="absolute right-1.5 top-1.5 z-20 max-w-[calc(100%-8px)] rounded-md border border-white/10 bg-black/60 px-1 py-0.5 backdrop-blur-sm">
          <CoinPrice value={skin.price} iconClassName="h-2.5 w-2.5" textClassName="text-[8px] font-bold text-gold font-display" />
        </div>

        <div className="absolute inset-x-0 top-1 bottom-10 z-[1]">
          <SkinImage
            src={skin.image}
            alt={skin.name}
            zoom={compact ? 1.28 : 1.18}
            layoutId={layoutId}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-2 pb-2 pt-8">
          <div className={`min-w-0 ${showSell ? 'pr-11' : ''}`}>
            <p className={`truncate font-semibold leading-tight text-white ${compact ? 'text-[9px]' : 'text-[11px]'}`}>
              {skin.name}
            </p>
            {!compact && <p className="mt-0.5 truncate text-[8px] text-white/40">{skin.wear}</p>}
          </div>
        </div>
      </button>

      {showSell && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onSell!(skin);
          }}
          className="group/sell absolute bottom-1.5 right-1.5 z-30 overflow-hidden rounded border border-gold/45 px-1.5 py-0.5 font-display text-[7px] font-bold uppercase tracking-[0.08em] text-[#1a1400] shadow-[0_0_14px_rgba(255,215,0,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-sm transition hover:border-gold hover:shadow-[0_0_22px_rgba(255,215,0,0.55)]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#ffe566] via-[#ffcc00] to-[#ffb800] opacity-95"
          />
          <span className="relative z-10">Sell</span>
        </button>
      )}

      {locked && <SkinLockOverlay label={lockLabel} compact={compact} className="z-40" />}
    </div>
  );
});
