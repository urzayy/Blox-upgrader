import { useEffect, useRef, useState } from 'react';
import type { BattleMode, BattleStatus } from '../../lib/caseBattles';
import { BATTLE_MODE_META } from '../../lib/caseBattles';
import { catalogCaseToTier } from '../../lib/catalogCaseUi';
import type { CatalogCase } from '../../lib/caseCatalog';
import { CoinPrice } from '../ui/CoinPrice';

export interface BattleCaseRoundItem extends CatalogCase {
  battlePrice: number;
  joker?: boolean;
}

interface Props {
  cases: BattleCaseRoundItem[];
  currentRound: number;
  status: BattleStatus;
  mode: BattleMode;
  isOpeningRound?: boolean;
}

function recenterOffset(container: HTMLElement, item: HTMLElement): number {
  const containerCenter = container.clientWidth / 2;
  const itemCenter = item.offsetLeft + item.clientWidth / 2;
  return containerCenter - itemCenter;
}

export function BattleCaseRoundStrip({
  cases,
  currentRound,
  status,
  mode,
  isOpeningRound = false,
}: Props) {
  const modeMeta = BATTLE_MODE_META[mode];
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  const focusedIndex =
    status === 'finished'
      ? Math.max(0, cases.length - 1)
      : Math.min(Math.max(currentRound, 0), Math.max(0, cases.length - 1));

  const progress =
    cases.length === 0
      ? 0
      : status === 'finished'
        ? 1
        : Math.min(1, (currentRound + (isOpeningRound ? 0.35 : 0)) / cases.length);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const update = () => {
      const item = track.querySelector(`[data-case-index="${focusedIndex}"]`) as HTMLElement | null;
      if (!item) return;
      setOffset(recenterOffset(container, item));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(track);
    return () => ro.disconnect();
  }, [focusedIndex, cases.length]);

  if (!cases.length) return null;

  return (
    <div className="min-w-0">
      <p className="mb-3 text-center font-display text-[11px] font-black uppercase tracking-[0.22em] text-white/80 sm:text-xs">
        Case Battle
      </p>

      <div ref={containerRef} className="relative overflow-hidden px-1">
        <div
          ref={trackRef}
          className="flex items-end gap-4 transition-transform duration-500 ease-out will-change-transform sm:gap-5"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {cases.map((item, index) => {
            const tier = catalogCaseToTier(item);
            const isPast = index < currentRound || status === 'finished';
            const isActive =
              status === 'in_progress' && index === currentRound;

            return (
              <div
                key={`${item.slug}-${index}`}
                data-case-index={index}
                className={`flex w-24 shrink-0 flex-col items-center sm:w-28 lg:w-32 ${
                  isPast ? 'opacity-45' : 'opacity-100'
                }`}
              >
                {isActive && (
                  <svg
                    viewBox="0 0 16 10"
                    className="mb-1 h-2.5 w-4 text-amber-300"
                    aria-hidden="true"
                  >
                    <path fill="currentColor" d="M8 10 0 0h16L8 10z" />
                  </svg>
                )}

                <div
                  className={`h-24 w-24 overflow-hidden rounded-xl border bg-[#12101c] sm:h-28 sm:w-28 lg:h-32 lg:w-32 ${
                    isActive ? `${modeMeta.border} ring-2 ring-lime-400/30` : 'border-white/10'
                  }`}
                >
                  {tier.image ? (
                    <img
                      src={tier.image}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : null}
                </div>

                <CoinPrice
                  value={item.battlePrice}
                  textClassName="mt-2 font-display text-[11px] font-black text-white/70 sm:text-xs"
                  iconClassName="h-3 w-3"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-4 h-1 max-w-[min(100%,42rem)] overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
