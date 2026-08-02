import { useEffect, useMemo, useRef, useState } from 'react';
import type { GiveawayParticipant, GiveawayWinnerInfo } from '../../lib/giveawayApi';

const SLICE_COLORS = [
  '#7c3aed', '#db2777', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#0891b2', '#4f46e5', '#ca8a04', '#be185d',
];

export interface WheelSlice {
  participant: GiveawayParticipant;
  startAngle: number;
  endAngle: number;
  color: string;
  chancePercent: number;
}

function buildSlices(participants: GiveawayParticipant[], totalEntries: number): WheelSlice[] {
  const eligible = participants.filter(p => p.entries > 0);
  if (!eligible.length) return [];

  let cursor = 0;
  return eligible.map((participant, index) => {
    const fraction = participant.entries / totalEntries;
    const sweep = fraction * 360;
    const slice: WheelSlice = {
      participant,
      startAngle: cursor,
      endAngle: cursor + sweep,
      color: SLICE_COLORS[index % SLICE_COLORS.length],
      chancePercent: fraction * 100,
    };
    cursor += sweep;
    return slice;
  });
}

function slicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = (startAngle - 90) * (Math.PI / 180);
  const end = (endAngle - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function findWinnerSlice(slices: WheelSlice[], winner: GiveawayWinnerInfo): WheelSlice | null {
  return slices.find(s => s.participant.userId === winner.userId) ?? null;
}

function computeLandingRotation(slice: WheelSlice, extraSpins = 5): number {
  const midAngle = (slice.startAngle + slice.endAngle) / 2;
  return extraSpins * 360 + (360 - midAngle);
}

interface Props {
  participants: GiveawayParticipant[];
  totalEntries: number;
  winner: GiveawayWinnerInfo;
  onComplete?: () => void;
}

export function GiveawayWheelSpin({ participants, totalEntries, winner, onComplete }: Props) {
  const slices = useMemo(
    () => buildSlices(participants, totalEntries),
    [participants, totalEntries],
  );
  const winnerSlice = useMemo(
    () => findWinnerSlice(slices, winner),
    [slices, winner],
  );

  const [phase, setPhase] = useState<'spinning' | 'done'>('spinning');
  const [rotation, setRotation] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!winnerSlice) {
      setPhase('done');
      return;
    }
    const target = computeLandingRotation(winnerSlice);
    const frame = requestAnimationFrame(() => setRotation(target));
    return () => cancelAnimationFrame(frame);
  }, [winnerSlice]);

  useEffect(() => {
    if (phase !== 'done' || completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
  }, [phase, onComplete]);

  const displayName = winner.nickname || winner.email.split('@')[0] || 'Winner';
  const chanceLabel = winner.chancePercent.toFixed(winner.chancePercent > 0 && winner.chancePercent < 1 ? 2 : 1);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-violet-500/30 bg-[#101018]/95 p-6 shadow-2xl">
        <h3 className="mb-1 text-center font-display text-lg font-black uppercase tracking-wide text-white">
          {phase === 'done' ? 'We have a winner!' : 'Spinning…'}
        </h3>
        <p className="mb-5 text-center text-xs text-white/45">
          Slice size = entries · pointer picks the winner
        </p>

        <div className="relative mx-auto mb-5" style={{ width: 280, height: 280 }}>
          <div
            className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1"
            aria-hidden="true"
          >
            <div className="h-0 w-0 border-x-[10px] border-b-[18px] border-x-transparent border-b-amber-400 drop-shadow-lg" />
          </div>

          <svg
            viewBox="0 0 200 200"
            className="h-full w-full drop-shadow-xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: phase === 'spinning' ? 'transform 4.5s cubic-bezier(0.15, 0.85, 0.2, 1)' : undefined,
            }}
            onTransitionEnd={() => setPhase('done')}
          >
            <circle cx="100" cy="100" r="98" fill="#0c0a14" stroke="#3d3358" strokeWidth="2" />
            {slices.map(slice => (
              <path
                key={slice.participant.userId}
                d={slicePath(100, 100, 92, slice.startAngle, slice.endAngle)}
                fill={slice.color}
                stroke="#0c0a14"
                strokeWidth="1"
              />
            ))}
            <circle cx="100" cy="100" r="22" fill="#141024" stroke="#7c3aed" strokeWidth="2" />
          </svg>
        </div>

        {phase === 'done' && (
          <div className="text-center">
            <p className="font-display text-2xl font-black uppercase tracking-wide text-amber-300">
              {displayName}
            </p>
            <p className="mt-1 text-sm text-white/50">
              Won with {winner.entries} {winner.entries === 1 ? 'entry' : 'entries'} · {chanceLabel}% chance
            </p>
          </div>
        )}

        {phase === 'done' && (
          <button
            type="button"
            onClick={() => onComplete?.()}
            className="mt-5 w-full rounded-xl bg-violet-600 py-3 font-display text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-violet-500"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export function wheelSeenKey(period: string, closedAt: number | null): string {
  return `giveaway-wheel-seen:${period}:${closedAt ?? 0}`;
}

export function hasSeenWheel(period: string, closedAt: number | null): boolean {
  try {
    return localStorage.getItem(wheelSeenKey(period, closedAt)) === '1';
  } catch {
    return false;
  }
}

export function markWheelSeen(period: string, closedAt: number | null): void {
  try {
    localStorage.setItem(wheelSeenKey(period, closedAt), '1');
  } catch {
    // ignore
  }
}
