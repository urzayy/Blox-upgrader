interface Props {
  code: string;
  applied: boolean;
  bonusPercent: number;
  error: string;
  onCodeChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export function DepositBonusCodeField({
  code,
  applied,
  bonusPercent,
  error,
  onCodeChange,
  onApply,
  onClear,
}: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex min-w-0 items-center gap-2">
        <label className="shrink-0 font-display text-[10px] font-bold uppercase tracking-wide text-white/45">
          Code
        </label>
        <input
          type="text"
          value={code}
          disabled={applied}
          onChange={event => onCodeChange(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onApply();
            }
          }}
          placeholder="Bonus code"
          className="input-filter min-w-0 flex-1 py-1.5 text-[10px] uppercase disabled:opacity-50"
        />
        {applied ? (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-lg border border-white/15 px-2.5 py-1.5 font-display text-[10px] font-bold uppercase tracking-wide text-white/55 transition hover:border-white/30 hover:text-white"
          >
            Clear
          </button>
        ) : (
          <button
            type="button"
            onClick={onApply}
            className="shrink-0 rounded-lg border border-gold/45 bg-[#ffcc00] px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-wide text-[#1a1400] shadow-[0_0_16px_rgba(255,204,0,0.25)] transition hover:border-gold hover:brightness-105"
          >
            Apply
          </button>
        )}
      </div>
      {applied && (
        <p className="text-[10px] font-semibold text-win">
          +{bonusPercent}% deposit bonus applied
        </p>
      )}
      {error && (
        <p className="text-[10px] text-risk">{error}</p>
      )}
    </div>
  );
}
