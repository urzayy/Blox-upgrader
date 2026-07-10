interface Props {
  multiplier: number | null;
  onMultiplier: (m: number) => void;
  disabled?: boolean;
}

const MULTS = [1.5, 2, 5, 10, 20] as const;

export function UpgradeMultiplierBar({ multiplier, onMultiplier, disabled = false }: Props) {
  return (
    <div className={`mt-3 flex flex-wrap justify-center gap-2 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
      {MULTS.map(m => (
        <button
          key={m}
          type="button"
          onClick={() => onMultiplier(m)}
          className={`min-w-[52px] rounded-lg border px-3 py-1.5 font-display text-[11px] font-bold transition ${
            multiplier === m
              ? 'border-gold bg-gold/20 text-gold shadow-[0_0_16px_rgba(176,108,255,0.3)]'
              : 'border-white/10 bg-[#1a1530] text-white/60 hover:border-violet-500/30 hover:text-white'
          }`}
        >
          {m}x
        </button>
      ))}
    </div>
  );
}
