import { SkinImage } from '../skins/SkinImage';
import { CoinPrice } from '../ui/CoinPrice';
import { TurboToggleButton } from './TurboToggleButton';
import { inventoryTotal } from '../../lib/inventory';
import type { Skin } from '../../data/skins';

interface Props {
  variant: 'input' | 'target';
  skins?: Skin[];
  skin?: Skin | null;
  rolling?: boolean;
  turbo?: boolean;
  onTurboToggle?: () => void;  onRandom?: () => void;
  onSelectAll?: () => void;
  onClear?: () => void;
  onUpgrade?: () => void;
  canUpgrade?: boolean;
  spinning?: boolean;
  requiresLogin?: boolean;
}

const UPGRADE_PANEL_BG = '/images/upgrade-karambit.png';

export function UpgradeSelectionPanel({
  variant,
  skins = [],
  skin = null,
  rolling = false,
  onRandom,
  onSelectAll,
  onClear,
  onUpgrade,
  turbo = false,
  onTurboToggle,
  canUpgrade = false,  spinning = false,
  requiresLogin = false,
}: Props) {
  const isInput = variant === 'input';
  const list = isInput ? skins : skin ? [skin] : [];
  const hasSelection = list.length > 0;
  const total = inventoryTotal(list);

  return (
    <div className="relative flex min-h-[280px] flex-1 flex-col overflow-hidden rounded-2xl border border-violet-500/10 bg-[#141024]/80 p-4 sm:min-h-[320px] sm:p-5">
      {isInput && onTurboToggle && (
        <TurboToggleButton
          active={turbo}
          onClick={onTurboToggle}
          className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4"
        />
      )}

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">        <img
          src={UPGRADE_PANEL_BG}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-40 sm:max-w-[480px]"
          draggable={false}
        />

        {hasSelection ? (
          <div className="relative w-full max-w-[200px]">
            <SkinImage src={list[0].image} alt={list[0].name} zoom={1.1} />
            {!isInput && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="absolute -right-1 -top-1 rounded-full border border-white/15 bg-black/70 px-2 py-0.5 text-[10px] text-white/60 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        ) : null}
      </div>

      <p className="relative z-10 mt-3 text-center text-[11px] leading-relaxed text-white/50 sm:text-xs">
        {isInput
          ? 'Select an item you want to upgrade'
          : 'Select an item you want to obtain'}
      </p>

      {isInput && (
        <div className="relative z-10 mt-3 flex justify-center gap-2">
          <button
            type="button"
            onClick={onRandom}
            className="rounded-lg border border-white/10 bg-[#1a1530] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/55 transition hover:border-violet-500/25 hover:text-white"
          >
            Random
          </button>
          <button
            type="button"
            onClick={onSelectAll}
            className="rounded-lg border border-white/10 bg-[#1a1530] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/55 transition hover:border-violet-500/25 hover:text-white"
          >
            Select all
          </button>
        </div>
      )}

      <div className="relative z-10 mt-4 rounded-xl border border-white/[0.06] bg-[#100d1a]/90 px-3 py-2.5 text-center">
        {!hasSelection ? (
          <p className="text-[11px] font-medium text-white/35">Nothing selected</p>
        ) : isInput && list.length > 1 ? (
          <div>
            <p className="text-[11px] font-semibold text-white/75">{list.length} items selected</p>
            <CoinPrice
              value={total}
              iconClassName="mx-auto mt-1 h-3 w-3"
              textClassName="text-xs font-bold text-gold"
              className="justify-center"
            />
          </div>
        ) : (
          <div>
            <p className="truncate text-[11px] font-semibold text-white/80">{list[0].name}</p>
            <CoinPrice
              value={list[0].price}
              iconClassName="mx-auto mt-1 h-3 w-3"
              textClassName="text-xs font-bold text-win"
              className="justify-center"
            />
          </div>
        )}
        {rolling && (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-gold">Rolling...</p>
        )}
      </div>

      {!isInput && onUpgrade && (
        <button
          type="button"
          disabled={!canUpgrade || spinning}
          onClick={onUpgrade}
          className="relative z-10 mt-4 w-full rounded-xl bg-gradient-to-r from-[#ec4899] via-[#d946ef] to-[#a855f7] py-3.5 font-display text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_28px_rgba(236,72,153,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35"
        >
          {spinning ? 'Rolling...' : requiresLogin && canUpgrade ? 'Log in' : 'Upgrade items'}
        </button>
      )}
    </div>
  );
}
