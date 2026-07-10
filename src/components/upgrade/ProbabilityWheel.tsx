import { useId, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  buildOctagonWinPerimeterSpans,
  needleGeometry,
  octagonInnerTicks,
  octagonPoints,
  octagonVertices,
  type RollResult,
} from '../../lib/wheelMath';
import { WheelResultFx } from './WheelResultFx';

interface Props {
  probability: number;
  size?: number;
  arrowAngle?: number;
  spinning?: boolean;
  phase?: 'idle' | 'spin' | 'win' | 'lose';
  rollResult?: RollResult | null;
  showRiskyLabel?: boolean;
}

const CX = 200;
const CY = 200;
const CHANCE_R = 176;

function ReferenceFrame({ uid, hideTrack }: { uid: string; hideTrack?: boolean }) {
  const shell = octagonPoints(CX, CY, 198);
  const outer = octagonPoints(CX, CY, 192);
  const glow = octagonPoints(CX, CY, 186);
  const inner = octagonPoints(CX, CY, 180);
  const track = octagonPoints(CX, CY, CHANCE_R);

  return (
    <g>
      <polygon points={shell} fill="#08060f" stroke="#0c0a14" strokeWidth="2" />
      <polygon
        points={outer}
        fill={`url(#shellTex_${uid})`}
        stroke={`url(#borderGlow_${uid})`}
        strokeWidth="1.8"
        filter={`url(#borderBlur_${uid})`}
      />
      <polygon points={glow} fill="none" stroke="#5b21b6" strokeWidth="0.9" opacity="0.35" />
      <polygon points={inner} fill="none" stroke="#7c3aed" strokeWidth="0.6" opacity="0.22" />
      {!hideTrack && (
        <polygon points={track} fill="none" stroke="#3d3358" strokeWidth="1" opacity="0.55" />
      )}

      {octagonVertices(CX, CY, 192).map((v, i) => {
        const vIn = octagonVertices(CX, CY, 178)[i];
        return (
          <line
            key={i}
            x1={v.x}
            y1={v.y}
            x2={vIn.x}
            y2={vIn.y}
            stroke="#6b5f82"
            strokeWidth="1"
            opacity="0.45"
          />
        );
      })}

      {[-1, 1].map(sign => (
        <g key={sign}>
          {[-20, -10, 0, 10, 20].map((offset, i) => (
            <circle
              key={i}
              cx={CX + offset}
              cy={CY + sign * 194}
              r={i === 2 ? 2.6 : 1.8}
              fill={i === 2 ? '#e879f9' : '#8b5cf6'}
              opacity={i === 2 ? 0.95 : 0.45}
              filter={i === 2 ? `url(#purpleDot_${uid})` : undefined}
            />
          ))}
        </g>
      ))}

      {[-1, 1].map(sign => (
        <g key={`side-${sign}`} opacity="0.35">
          <line x1={CX + sign * 188} y1={CY - 18} x2={CX + sign * 188} y2={CY + 18} stroke="#6b5f8a" strokeWidth="1" />
          <line x1={CX + sign * 182} y1={CY - 8} x2={CX + sign * 194} y2={CY - 8} stroke="#6b5f8a" strokeWidth="0.8" />
          <line x1={CX + sign * 182} y1={CY + 8} x2={CX + sign * 194} y2={CY + 8} stroke="#6b5f8a" strokeWidth="0.8" />
        </g>
      ))}
    </g>
  );
}

export function ProbabilityWheel({
  probability,
  size = 340,
  arrowAngle = 0,
  spinning = false,
  phase = 'idle',
  rollResult = null,
  showRiskyLabel = true,
}: Props) {
  const uid = useId().replace(/:/g, '');

  const winSpans = useMemo(() => {
    if (probability <= 0) return [];
    return buildOctagonWinPerimeterSpans(CX, CY, CHANCE_R, probability);
  }, [probability]);
  const needle = useMemo(() => needleGeometry(CX, CY, arrowAngle), [arrowAngle]);
  const ticks = useMemo(() => octagonInnerTicks(CX, CY, 168, 128), []);

  const showResult = phase === 'win' || phase === 'lose';
  const showCenter = !showResult;
  const displayProbability = probability.toFixed(3);

  return (
    <div className="relative mx-auto gpu" style={{ width: size, height: size }}>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-900/15 blur-[48px]"
        style={{
          width: size * 0.82,
          height: size * 0.82,
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
        }}
      />

      <svg viewBox="0 0 400 400" className="h-full w-full drop-shadow-[0_16px_44px_rgba(0,0,0,0.75)]">
        <defs>
          <pattern id={`shellTex_${uid}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="5" height="5" fill="#100d18" />
            <line x1="0" y1="0" x2="0" y2="5" stroke="#18142a" strokeWidth="1" />
          </pattern>

          <linearGradient id={`borderGlow_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          <radialGradient id={`face_${uid}`} cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#2e2248" />
            <stop offset="45%" stopColor="#1c1530" />
            <stop offset="100%" stopColor="#0a0712" />
          </radialGradient>

          <radialGradient id={`mist_${uid}`} cx="48%" cy="36%" r="48%">
            <stop offset="0%" stopColor="#5b4a78" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#5b4a78" stopOpacity="0" />
          </radialGradient>

          <filter id={`borderBlur_${uid}`}>
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`purpleDot_${uid}`}>
            <feGaussianBlur stdDeviation="1.8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`chanceGlow_${uid}`} filterUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`chanceGlowSoft_${uid}`} filterUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          <linearGradient id={`chancePurple_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="35%" stopColor="#e879f9" />
            <stop offset="70%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#a21caf" />
          </linearGradient>
          <filter id={`needleGlow_${uid}`} filterUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`needleTrailGlow_${uid}`} filterUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /></feMerge>
          </filter>

          <clipPath id={`dialClip_${uid}`}>
            <polygon points={octagonPoints(CX, CY, 168)} />
          </clipPath>
        </defs>

        <ReferenceFrame uid={uid} hideTrack={probability > 0} />

        <g clipPath={`url(#dialClip_${uid})`}>
          <polygon points={octagonPoints(CX, CY, 168)} fill={`url(#face_${uid})`} />
          <polygon points={octagonPoints(CX, CY, 168)} fill={`url(#mist_${uid})`} />

          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.major ? '#7a6d96' : '#4a4260'}
              strokeWidth={t.major ? 0.9 : 0.55}
              opacity={t.major ? 0.42 : 0.22}
            />
          ))}

        </g>

        <g className="win-perimeter" pointerEvents="none">
          {winSpans.map((seg, i) => (
            <line
              key={`span-bloom-${i}`}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke="#a21caf"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.35"
              filter={`url(#chanceGlowSoft_${uid})`}
            />
          ))}

          {winSpans.map((seg, i) => (
            <line
              key={`span-glow-${i}`}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke="#d946ef"
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.55"
              filter={`url(#chanceGlow_${uid})`}
            />
          ))}

          {winSpans.map((seg, i) => (
            <line
              key={`span-main-${i}`}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke={`url(#chancePurple_${uid})`}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          ))}

          {winSpans.map((seg, i) => (
            <line
              key={`span-core-${i}`}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke="#fae8ff"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.95"
            />
          ))}
        </g>

        {showCenter && (
          <g textAnchor="middle">
            <text
              x={CX}
              y={CY + 1}
              fill="#ffffff"
              fontFamily="Orbitron, system-ui, sans-serif"
              fontSize="33"
              fontWeight="700"
              letterSpacing="0.3"
            >
              {displayProbability}
              <tspan fontSize="21" fill="#d4cce8" dx="4"> %</tspan>
            </text>
            {showRiskyLabel && (
              <text
                x={CX}
                y={CY + 24}
                fill="#9d8fb8"
                fontFamily="Orbitron, system-ui, sans-serif"
                fontSize="10"
                fontWeight="600"
                letterSpacing="3"
              >
                RISKY CHANCE
              </text>
            )}
          </g>
        )}

        <g className="needle" pointerEvents="none">
          {spinning &&
            needle.trail.map((seg, i) => (
              <polygon
                key={i}
                points={`${seg.tip.x},${seg.tip.y} ${seg.baseL.x},${seg.baseL.y} ${seg.baseR.x},${seg.baseR.y}`}
                fill="#a855f7"
                opacity={seg.opacity}
                filter={`url(#needleTrailGlow_${uid})`}
              />
            ))}
          <polygon
            points={`${needle.tip.x},${needle.tip.y} ${needle.baseL.x},${needle.baseL.y} ${needle.baseR.x},${needle.baseR.y}`}
            fill="#c084fc"
            filter={`url(#needleGlow_${uid})`}
          />
        </g>
      </svg>

      <AnimatePresence>
        {showResult && rollResult && (
          <WheelResultFx key={phase} phase={phase} size={size} rollResult={rollResult} />
        )}
      </AnimatePresence>
    </div>
  );
}
