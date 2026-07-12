import { Fragment } from 'react';
import type { ReactNode } from 'react';
import type { BattleFormat } from '../../lib/caseBattles';
import type { BattleSide } from '../../lib/battleSides';
import {
  arenaGapClass,
  getBattleArenaSegments,
  segmentGridClass,
  segmentIsWinningSide,
} from '../../lib/battleArenaLayout';
import { BattleTeamHeader, BattleTeamSection } from './BattleTeamHeader';
import { BattleVsBadge } from './BattleVsBadge';

interface Props {
  format: BattleFormat;
  maxPlayers: number;
  sideTotals: Record<BattleSide, number>;
  winningSide: BattleSide | null;
  centerContent?: ReactNode;
  children: (slotIndex: number) => ReactNode;
}

function VsDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex shrink-0 items-center justify-center self-stretch px-0.5 sm:px-1">
      <div className="sticky top-1/2 -translate-y-1/2">
        <BattleVsBadge compact={compact} />
      </div>
    </div>
  );
}

function TeamHeaderRow({
  sideTotals,
  winningSide,
  centerContent,
}: {
  sideTotals: Record<BattleSide, number>;
  winningSide: BattleSide | null;
  centerContent?: ReactNode;
}) {
  const ctWinning = winningSide === 'counter-terrorist';
  const tWinning = winningSide === 'terrorist';

  return (
    <div className="mb-2 grid grid-cols-1 items-end gap-x-3 gap-y-2 sm:mb-2.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <BattleTeamHeader
        side="counter-terrorist"
        total={sideTotals['counter-terrorist']}
        isWinning={ctWinning}
        compact
        className="order-2 sm:order-1"
      />

      <div className="order-1 flex items-center justify-center gap-2 pb-0.5 sm:order-2 sm:gap-3">
        {centerContent}
      </div>

      <BattleTeamHeader
        side="terrorist"
        total={sideTotals.terrorist}
        isWinning={tWinning}
        compact
        className="order-3 justify-end sm:justify-start"
      />
    </div>
  );
}

export function BattleArenaGrid({
  format,
  maxPlayers,
  sideTotals,
  winningSide,
  centerContent,
  children,
}: Props) {
  const segments = getBattleArenaSegments(format);
  const gapClass = arenaGapClass(maxPlayers);
  const vsCompact = segments.length > 2;

  return (
    <div className="w-full">
      <TeamHeaderRow
        sideTotals={sideTotals}
        winningSide={winningSide}
        centerContent={centerContent}
      />

      <div
        className={`flex w-full flex-col items-stretch gap-2 ${
          segments.length > 2
            ? 'sm:flex-row sm:gap-1 lg:gap-1.5'
            : 'sm:flex-row sm:gap-2 lg:gap-3'
        }`}
      >
        {segments.map((indices, segmentIndex) => (
          <Fragment key={`segment-${segmentIndex}`}>
            {segmentIndex > 0 && <VsDivider compact={vsCompact} />}

            <BattleTeamSection
              isWinning={segmentIsWinningSide(format, segmentIndex, winningSide)}
              indices={indices}
              gridClass={segmentGridClass(indices.length)}
              gapClass={gapClass}
              className="min-w-0 flex-1"
            >
              {children}
            </BattleTeamSection>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
