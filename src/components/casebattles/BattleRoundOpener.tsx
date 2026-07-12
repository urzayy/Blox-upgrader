import type { Skin } from '../../data/skins';
import type { FreeCaseReelResult } from '../../lib/freeCaseReel';
import { FreeCaseReelOpener, getMultiReelLayout } from '../freecases/FreeCaseReelOpener';

export interface BattleRoundSession {
  id: string;
  playerId: string;
  result: FreeCaseReelResult;
  grantedSkin: Skin;
  revealed: boolean;
}

interface Props {
  active: boolean;
  caseSlug: string;
  caseLabel: string;
  sessions: BattleRoundSession[];
  onReveal: (sessionId: string) => void;
}

export function BattleRoundOpener({
  active,
  caseSlug,
  caseLabel,
  sessions,
  onReveal,
}: Props) {
  const layout = getMultiReelLayout(sessions.length);
  const boardWidth = layout.columnWidth * sessions.length;
  const allRevealed = sessions.length > 0 && sessions.every(session => session.revealed);
  const revealedCount = sessions.filter(session => session.revealed).length;

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300/80 sm:text-[11px]">
          {caseLabel}
        </p>
        <h2 className="mt-1 font-display text-lg font-black uppercase tracking-[0.1em] text-white sm:text-xl">
          {allRevealed ? 'Round complete' : 'Opening cases…'}
        </h2>
        {!allRevealed && (
          <p className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/40 sm:text-[11px]">
            {revealedCount > 0
              ? `${revealedCount}/${sessions.length} ready`
              : 'Wait for the reels to finish'}
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
                    <div key={session.id} className="shrink-0" style={{ width: layout.columnWidth }}>
                      <FreeCaseReelOpener
                        active={active}
                        caseSlug={caseSlug}
                        result={session.result}
                        grantedSkin={session.grantedSkin}
                        caseLabel={caseLabel}
                        turbo={false}
                        soundOn
                        size={layout.size}
                        orientation="vertical"
                        embedded
                        compact
                        showHeader={false}
                        showRevealActions={false}
                        onReveal={() => onReveal(session.id)}
                        onSell={() => undefined}
                        onUpgrade={() => undefined}
                      />
                    </div>
                  ))}
                </div>

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
    </div>
  );
}
