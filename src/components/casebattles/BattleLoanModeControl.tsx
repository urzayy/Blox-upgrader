import { useState } from 'react';
import {
  BATTLE_LOAN_MAX_PERCENT,
  BATTLE_LOAN_MIN_PERCENT,
  BATTLE_LOAN_MODE_TOOLTIP,
} from '../../lib/caseBattleCreate';

interface Props {
  loanMode: boolean;
  loanPercent: number;
  onLoanModeChange: (enabled: boolean) => void;
  onLoanPercentChange: (percent: number) => void;
}

export function BattleLoanModeControl({
  loanMode,
  loanPercent,
  onLoanModeChange,
  onLoanPercentChange,
}: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const payShare = 100 - loanPercent;
  const winShare = payShare;

  const clampPercent = (value: number) =>
    Math.max(BATTLE_LOAN_MIN_PERCENT, Math.min(BATTLE_LOAN_MAX_PERCENT, value));

  return (
    <div className="min-w-0">
      <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
        Loan mode
      </p>

      <div className="inline-flex rounded-lg border border-white/10 bg-[#171a22] p-1">
        <button
          type="button"
          onClick={() => onLoanModeChange(false)}
          className={`rounded-md px-3 py-2 font-display text-[10px] font-black uppercase tracking-[0.1em] transition sm:text-[11px] ${
            !loanMode ? 'bg-lime-400 text-[#10140f]' : 'text-white/45 hover:text-white/70'
          }`}
        >
          Apagado
        </button>

        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
        >
          <button
            type="button"
            onClick={() => onLoanModeChange(true)}
            className={`rounded-md px-3 py-2 font-display text-[10px] font-black uppercase tracking-[0.1em] transition sm:text-[11px] ${
              loanMode ? 'bg-lime-400 text-[#10140f]' : 'text-white/45 hover:text-white/70'
            }`}
          >
            Encendido
          </button>

          {showTooltip && (
            <div className="absolute bottom-[calc(100%+0.5rem)] left-1/2 z-30 w-64 -translate-x-1/2 rounded-lg border border-white/10 bg-[#171a22] px-3 py-2.5 text-left shadow-[0_12px_40px_rgba(0,0,0,0.65)]">
              <p className="font-display text-[10px] font-bold leading-relaxed text-white/75">
                {BATTLE_LOAN_MODE_TOOLTIP}
              </p>
            </div>
          )}
        </div>
      </div>

      {loanMode && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
              Loan
            </span>
            <span className="font-display text-sm font-black tabular-nums text-violet-300">
              {loanPercent}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onLoanPercentChange(clampPercent(loanPercent - 1))}
              disabled={loanPercent <= BATTLE_LOAN_MIN_PERCENT}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#1a1530] font-display text-sm font-black text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease loan"
            >
              −
            </button>

            <input
              type="range"
              min={BATTLE_LOAN_MIN_PERCENT}
              max={BATTLE_LOAN_MAX_PERCENT}
              value={loanPercent}
              onChange={event => onLoanPercentChange(Number(event.target.value))}
              className="min-w-0 flex-1 accent-violet-500"
            />

            <button
              type="button"
              onClick={() => onLoanPercentChange(clampPercent(loanPercent + 1))}
              disabled={loanPercent >= BATTLE_LOAN_MAX_PERCENT}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#1a1530] font-display text-sm font-black text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase loan"
            >
              +
            </button>
          </div>

          <p className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">
            Pagas {payShare}% · Ganas {winShare}%
          </p>
        </div>
      )}
    </div>
  );
}
