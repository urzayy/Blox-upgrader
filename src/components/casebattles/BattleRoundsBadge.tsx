import type { BattleMode } from '../../lib/caseBattles';

function modeAccentClass(mode: BattleMode, kind: 'border' | 'ring' | 'text' | 'bg'): string {
  switch (mode) {
    case 'underdog':
      return kind === 'border' ? 'border-violet-400/80 text-violet-300'
        : kind === 'ring' ? 'ring-violet-400/80'
        : kind === 'bg' ? 'bg-violet-400/90'
        : 'text-violet-300';
    case 'share':
      return kind === 'border' ? 'border-sky-400/80 text-sky-300'
        : kind === 'ring' ? 'ring-sky-400/80'
        : kind === 'bg' ? 'bg-sky-400/90'
        : 'text-sky-300';
    case 'jackpot':
      return kind === 'border' ? 'border-amber-400/80 text-amber-300'
        : kind === 'ring' ? 'ring-amber-400/80'
        : kind === 'bg' ? 'bg-amber-400/90'
        : 'text-amber-300';
    case 'crazy-jackpot':
      return kind === 'border' ? 'border-red-400/80 text-red-300'
        : kind === 'ring' ? 'ring-red-400/80'
        : kind === 'bg' ? 'bg-red-400/90'
        : 'text-red-300';
    default:
      return kind === 'border' ? 'border-lime-400/80 text-lime-300'
        : kind === 'ring' ? 'ring-lime-400/80'
        : kind === 'bg' ? 'bg-lime-400/90'
        : 'text-lime-300';
  }
}

interface Props {
  roundCount: number;
  mode: BattleMode;
}

export function BattleRoundsBadge({ roundCount, mode }: Props) {
  const borderClass = modeAccentClass(mode, 'border');

  return (
    <div
      className={`relative flex h-14 w-14 rotate-45 items-center justify-center rounded-[0.65rem] border-2 bg-[#12101c] shadow-[inset_0_0_18px_rgba(0,0,0,0.45)] ${borderClass}`}
      aria-label={`${roundCount} rounds`}
    >
      <div className="-rotate-45">
        {roundCount <= 4 ? (
          <div className="grid grid-cols-2 gap-0.5">
            {Array.from({ length: Math.min(roundCount, 4) }, (_, index) => (
              <span
                key={index}
                className={`block h-2.5 w-2.5 rounded-[2px] ${modeAccentClass(mode, 'bg')}`}
              />
            ))}
          </div>
        ) : (
          <span className="font-display text-lg font-black tabular-nums">{roundCount}</span>
        )}
      </div>
    </div>
  );
}
