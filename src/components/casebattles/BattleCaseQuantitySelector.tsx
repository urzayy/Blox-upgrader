interface Props {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function BattleCaseQuantitySelector({ value, max, onChange, disabled, compact }: Props) {
  const canDecrease = value >= 1 && !disabled;
  const canIncrease = value < max && !disabled;

  return (
    <div
      className={`flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[#0c0a14]/95 ${
        compact ? 'px-2 py-1' : 'px-3 py-1.5'
      }`}
      role="group"
      aria-label="Number of cases"
      onClick={event => event.stopPropagation()}
    >
      <button
        type="button"
        disabled={!canDecrease}
        onClick={() => onChange(value - 1)}
        className={`flex items-center justify-center rounded-md border border-white/10 bg-[#1a1530] font-display font-black text-white/70 transition hover:bg-[#221c3a] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 ${
          compact ? 'h-7 w-7 text-sm' : 'h-8 w-8 text-base'
        }`}
        aria-label="Remove one case"
      >
        −
      </button>

      <span
        className={`min-w-[1.5rem] text-center font-display font-black tabular-nums text-white ${
          compact ? 'text-sm' : 'text-base'
        }`}
      >
        {value}
      </span>

      <button
        type="button"
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
        className={`flex items-center justify-center rounded-md border border-white/10 bg-[#1a1530] font-display font-black text-white/70 transition hover:bg-[#221c3a] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 ${
          compact ? 'h-7 w-7 text-sm' : 'h-8 w-8 text-base'
        }`}
        aria-label="Add one case"
      >
        +
      </button>
    </div>
  );
}
