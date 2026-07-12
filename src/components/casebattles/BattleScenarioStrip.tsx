import { catalogCaseToTier } from '../../lib/catalogCaseUi';
import type { CatalogCase } from '../../lib/caseCatalog';
import type { BattleMode } from '../../lib/caseBattles';

interface Props {
  cases: CatalogCase[];
  currentRound: number;
  mode: BattleMode;
  compact?: boolean;
}

function activeRingClass(mode: BattleMode): string {
  switch (mode) {
    case 'underdog':
      return 'ring-violet-400/80';
    case 'share':
      return 'ring-sky-400/80';
    case 'jackpot':
      return 'ring-amber-400/80';
    case 'crazy-jackpot':
      return 'ring-red-400/80';
    default:
      return 'ring-lime-400/80';
  }
}

export function BattleScenarioStrip({ cases, currentRound, mode, compact = false }: Props) {
  const activeClass = activeRingClass(mode);

  return (
    <div className={`flex min-w-0 items-end ${compact ? 'gap-2' : 'gap-3 sm:gap-4'}`}>
      {cases.map((item, index) => {
        const tier = catalogCaseToTier(item);
        const isActive = index === currentRound;
        const isPast = index < currentRound;

        return (
          <div
            key={`${item.slug}-${index}`}
            className={`relative flex shrink-0 flex-col items-center ${isPast ? 'opacity-45' : 'opacity-100'}`}
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
              className={`overflow-hidden rounded-md bg-[#171a22] ${
                compact ? 'h-11 w-11' : 'h-14 w-14 sm:h-16 sm:w-16'
              } ${isActive ? `ring-2 ${activeClass}` : 'ring-1 ring-white/10'}`}
            >
              {tier.image ? (
                <img
                  src={tier.image}
                  alt=""
                  className="h-full w-full object-cover object-center"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#252a38] text-[10px] font-bold text-white/35">
                  ?
                </div>
              )}
            </div>

            <span
              className={`mt-1 max-w-[4.5rem] truncate text-center font-display font-bold uppercase tracking-[0.08em] text-white/55 ${
                compact ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'
              }`}
            >
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
