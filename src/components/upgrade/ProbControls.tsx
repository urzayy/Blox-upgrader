interface Props {
  multiplier: number | null;
  cap: number | null;
  disabled?: boolean;
  onMultiplier: (m: number) => void;
  onCap: (c: number) => void;
}

export function ProbControls({ multiplier, cap, disabled = false, onMultiplier, onCap }: Props) {
  return (
    <div className={`flex flex-col items-center gap-2 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
      <div className="flex flex-wrap justify-center gap-1.5">
        {[2, 3, 5].map(m => (
          <button
            key={m}
            type="button"
            onClick={() => onMultiplier(m)}
            className={`rounded-lg border px-3 py-1.5 font-display text-[11px] font-bold transition ${
              multiplier === m
                ? 'border-gold bg-gold/20 text-gold shadow-gold'
                : 'border-gold/25 bg-elevated text-white/75 hover:border-gold hover:bg-gold/10 hover:text-gold'
            }`}
          >
            ×{m}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {[25, 35, 50, 75].map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onCap(p)}
            className={`rounded-lg border px-3 py-1.5 font-display text-[11px] font-bold transition ${
              cap === p
                ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-[0_0_16px_rgba(255,140,0,0.25)]'
                : 'border-orange-500/25 bg-elevated text-white/75 hover:border-orange-500 hover:bg-orange-500/10 hover:text-orange-400'
            }`}
          >
            {p}%
          </button>
        ))}
      </div>
    </div>
  );
}
