import { useMemo } from 'react';
import type { Skin } from '../../data/skins';
import type { FreeCaseReelResult } from '../../lib/freeCaseReel';
import { CoinPrice } from '../ui/CoinPrice';
import { FreeCaseReelOpener, getMultiReelLayout } from './FreeCaseReelOpener';

export interface CaseOpenSession {
  id: string;
  result: FreeCaseReelResult;
  grantedSkin: Skin | null;
  revealed: boolean;
  sold?: boolean;
}

interface Props {
  active: boolean;
  caseSlug: string;
  caseLabel: string;
  sessions: CaseOpenSession[];
  turbo: boolean;
  soundOn: boolean;
  onReveal: (sessionId: string) => void;
  onSellSession: (sessionId: string) => void;
  onSellAll: () => void;
  onClose: () => void;
}

const SELL_BUTTON_CLASS =
  'rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-5 py-2.5 font-display text-xs font-black uppercase tracking-[0.1em] text-white shadow-[0_0_18px_rgba(34,197,94,0.28)] transition hover:brightness-110';

const SELL_ITEM_BUTTON_CLASS =
  'inline-flex w-full items-center justify-center gap-1 py-2.5 font-display text-[9px] font-bold uppercase tracking-[0.08em] text-white/65 transition hover:bg-[#22c55e]/12 hover:text-[#86efac] sm:py-3 sm:text-[10px]';

export function MultiCaseReelBoard({
  active,
  caseSlug,
  caseLabel,
  sessions,
  turbo,
  soundOn,
  onReveal,
  onSellSession,
  onSellAll,
  onClose,
}: Props) {
  const layout = getMultiReelLayout(sessions.length);
  const boardWidth = layout.columnWidth * sessions.length;
  const allRevealed = sessions.length > 0 && sessions.every(session => session.revealed);
  const revealedCount = sessions.filter(session => session.revealed).length;
  const unsoldSessions = sessions.filter(session => !session.sold);
  const totalValue = useMemo(
    () =>
      unsoldSessions.reduce(
        (sum, session) => sum + (session.grantedSkin?.price ?? session.result.rewardSkin.price),
        0,
      ),
    [unsoldSessions],
  );

  return (
    <div className="w-full">
      <div className="mb-3 text-center">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300/80 sm:text-[11px]">
          {caseLabel} case
        </p>
        <h2 className="mt-1 font-display text-lg font-black uppercase tracking-[0.1em] text-white sm:text-xl">
          {allRevealed
            ? `${sessions.length} skins obtained!`
            : `Opening ${sessions.length} cases…`}
        </h2>
        {!allRevealed && (
          <p className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/40 sm:text-[11px]">
            {revealedCount > 0
              ? `Wait · ${revealedCount}/${sessions.length} ready`
              : 'Wait for all reels to finish'}
          </p>
        )}
      </div>

      <div className="w-full overflow-x-auto px-2 pb-1 sm:px-0">
        <div className="mx-auto w-max min-w-full sm:min-w-0">
          <div className="flex justify-center">
            <div className="shrink-0" style={{ width: boardWidth }}>
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0a12] shadow-[0_20px_56px_-14px_rgba(0,0,0,0.75)]">
                <div className="flex shrink-0 divide-x divide-white/[0.06]">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className="shrink-0"
                      style={{ width: layout.columnWidth }}
                    >
                      <FreeCaseReelOpener
                        active={active}
                        caseSlug={caseSlug}
                        result={session.result}
                        grantedSkin={session.grantedSkin}
                        caseLabel={caseLabel}
                        turbo={turbo}
                        soundOn={soundOn}
                        size={layout.size}
                        orientation="vertical"
                        embedded
                        compact
                        showHeader={false}
                        showRevealActions={false}
                        onReveal={() => onReveal(session.id)}
                        onSell={onClose}
                        onUpgrade={onClose}
                      />
                    </div>
                  ))}
                </div>

                {allRevealed && (
                  <div className="flex divide-x divide-white/[0.06] border-t border-white/[0.06]">
                    {sessions.map(session => {
                      const skin = session.grantedSkin ?? session.result.rewardSkin;
                      return (
                        <div
                          key={session.id}
                          className="flex justify-center"
                          style={{ width: layout.columnWidth }}
                        >
                          {session.sold ? (
                            <span className="inline-flex w-full items-center justify-center py-2.5 font-display text-[9px] font-bold uppercase tracking-[0.08em] text-[#22c55e]/70 sm:py-3 sm:text-[10px]">
                              Vendido
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSellSession(session.id)}
                              className={SELL_ITEM_BUTTON_CLASS}
                            >
                              Sell for:
                              <CoinPrice
                                value={skin.price}
                                iconClassName="h-3 w-3"
                                textClassName="text-[10px] font-black text-gold sm:text-[11px]"
                                className="inline-flex"
                              />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!allRevealed && (
                  <div
                    className="pointer-events-none absolute inset-0 z-40 bg-[#080610]/10"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {allRevealed && unsoldSessions.length > 0 && (
        <div className="mt-4 flex justify-center sm:mt-5">
          <button type="button" onClick={onSellAll} className={SELL_BUTTON_CLASS}>
            Vender todo ·{' '}
            <CoinPrice
              value={totalValue}
              iconClassName="inline h-3 w-3"
              textClassName="text-xs font-black text-white"
              className="inline-flex align-middle"
            />
          </button>
        </div>
      )}
    </div>
  );
}
