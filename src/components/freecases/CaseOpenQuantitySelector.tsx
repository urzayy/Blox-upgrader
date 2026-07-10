export type CaseOpenQuantity = 1 | 2 | 3 | 4 | 5;

const QUANTITIES: CaseOpenQuantity[] = [1, 2, 3, 4, 5];

interface Props {
  value: CaseOpenQuantity;
  onChange: (value: CaseOpenQuantity) => void;
  disabled?: boolean;
}

export function CaseOpenQuantitySelector({ value, onChange, disabled }: Props) {
  return (
    <div
      className="flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.08] bg-[#0c0a14]/95 p-1.5 sm:gap-1.5 sm:p-2"
      role="group"
      aria-label="Cantidad de cajas a abrir"
    >
      {QUANTITIES.map(quantity => {
        const active = value === quantity;
        return (
          <button
            key={quantity}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(quantity)}
            className={`flex h-9 w-9 items-center justify-center rounded-md font-display text-sm font-black transition sm:h-10 sm:w-10 sm:text-base ${
              active
                ? 'border border-violet-400/70 bg-violet-500/15 text-violet-300 shadow-[0_0_14px_rgba(147,51,234,0.25)]'
                : 'border border-transparent bg-[#1a1530] text-white/55 hover:bg-[#221c3a] hover:text-white/80'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {quantity}
          </button>
        );
      })}
    </div>
  );
}
