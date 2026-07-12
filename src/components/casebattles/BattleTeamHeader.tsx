import type { ReactNode } from 'react';
import type { BattleSide } from '../../lib/battleSides';
import { BATTLE_SIDE_META } from '../../lib/battleSides';
import { CoinPrice } from '../ui/CoinPrice';

interface Props {
  side: BattleSide;
  total: number;
  isWinning: boolean;
  compact?: boolean;
  className?: string;
}

function WinningArrow() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0 text-lime-400" aria-hidden="true">
      <path d="M6 2 10 7H2L6 2Z" fill="currentColor" />
    </svg>
  );
}

export function BattleTeamHeader({ side, total, isWinning, compact = false, className = '' }: Props) {
  const meta = BATTLE_SIDE_META[side];

  return (
    <div className={`flex min-w-0 flex-col ${className}`}>
      <div
        className={`relative flex items-center gap-2 sm:gap-3 ${
          compact ? 'px-0 py-0' : 'border-b px-1 pb-3 pt-1 sm:px-2'
        } ${
          !compact && isWinning
            ? 'border-lime-400/35 shadow-[0_12px_28px_-18px_rgba(132,204,22,0.75)]'
            : !compact
              ? 'border-white/[0.06]'
              : ''
        }`}
      >
        {isWinning && (
          <div
            className={`pointer-events-none absolute bg-[radial-gradient(ellipse_at_center,rgba(132,204,22,0.22),transparent_72%)] ${
              compact ? 'inset-x-4 -top-2 h-6' : 'inset-x-8 -top-1 h-8'
            }`}
          />
        )}

        <div className="relative shrink-0">
          {isWinning && (
            <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 text-[9px] leading-none sm:-top-3 sm:text-[10px]">
              👑
            </span>
          )}
          <div
            className={`flex items-center justify-center overflow-hidden rounded-full border bg-black/20 ${
              compact ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-10 w-10 sm:h-11 sm:w-11'
            } ${
              isWinning
                ? 'border-lime-400/70 shadow-[0_0_22px_rgba(132,204,22,0.45)] ring-2 ring-lime-400/25'
                : 'border-white/10'
            }`}
          >
            <img src={meta.image} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate font-display font-black uppercase tracking-[0.08em] text-white ${
              compact ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'
            }`}
          >
            {meta.headerLabel}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <CoinPrice
            value={total}
            textClassName={`font-display font-black tabular-nums ${
              compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
            } ${isWinning ? 'text-lime-300' : 'text-white/70'}`}
            iconClassName={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}
          />
          {isWinning && <WinningArrow />}
        </div>
      </div>

      {isWinning && (
        <div
          className={`relative w-full overflow-hidden rounded-full ${
            compact ? 'mt-1 h-[3px]' : 'mt-1.5 h-1'
          }`}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-lime-400 shadow-[0_0_14px_rgba(132,204,22,0.95),0_0_28px_rgba(132,204,22,0.55),0_0_48px_rgba(74,222,128,0.35)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-lime-500/20 via-lime-200 to-lime-500/20 opacity-90" />
        </div>
      )}
    </div>
  );
}

interface TeamSectionProps {
  isWinning: boolean;
  indices: number[];
  gridClass: string;
  gapClass?: string;
  className?: string;
  children: (slotIndex: number) => ReactNode;
}

export function BattleTeamSection({
  isWinning,
  indices,
  gridClass,
  gapClass,
  className = '',
  children,
}: TeamSectionProps) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      {isWinning && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[2px]">
            <svg viewBox="0 0 16 10" className="h-2.5 w-4 text-lime-400 drop-shadow-[0_0_8px_rgba(132,204,22,0.8)]">
              <path d="M8 10 0 0h16L8 10Z" fill="currentColor" />
            </svg>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(ellipse_at_top,rgba(132,204,22,0.14),transparent_72%)]" />
        </>
      )}

      <div
        className={`relative overflow-hidden rounded-xl ${
          isWinning
            ? 'border border-lime-400/45 shadow-[0_0_32px_rgba(132,204,22,0.08)]'
            : 'border border-transparent'
        }`}
      >
        <div className={`grid w-full ${gapClass ?? 'gap-2 p-1.5 sm:gap-3 sm:p-2'} ${gridClass}`}>
          {indices.map(index => children(index))}
        </div>
      </div>
    </div>
  );
}
