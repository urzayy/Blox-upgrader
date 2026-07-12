import type { BattleSide } from '../../lib/battleSides';
import { BATTLE_SIDES, BATTLE_SIDE_META } from '../../lib/battleSides';

interface Props {
  value: BattleSide;
  onChange: (value: BattleSide) => void;
}

export function BattleSideToggle({ value, onChange }: Props) {
  return (
    <div className="min-w-0">
      <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
        Bando
      </p>

      <div className="inline-flex rounded-lg border border-white/10 bg-[#171a22] p-1">
        {BATTLE_SIDES.map(side => {
          const meta = BATTLE_SIDE_META[side];
          const active = value === side;

          return (
            <button
              key={side}
              type="button"
              onClick={() => onChange(side)}
              aria-label={meta.label}
              title={meta.label}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition sm:px-3 sm:py-2 ${
                active ? 'bg-lime-400 text-[#10140f]' : 'text-white/45 hover:text-white/70'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border ${
                  active ? 'border-[#10140f]/20 bg-black/10' : 'border-white/10 bg-black/20'
                }`}
              >
                <img
                  src={meta.image}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </span>
              <span className="font-display text-[10px] font-black uppercase tracking-[0.1em] sm:text-[11px]">
                {meta.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
