import { useId, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loseSectorPath, tickMarks, winSectorPath, type RollResult } from '../../lib/wheelMath';
import { WheelResultFx } from './WheelResultFx';

interface Props {
  probability: number;
  size?: number;
  arrowAngle?: number;
  spinning?: boolean;
  phase?: 'idle' | 'spin' | 'win' | 'lose';
  rollResult?: RollResult | null;
}

const CX = 200;
const CY = 200;
const OUTER = 168;
const INNER = 98;

export function ProbabilityWheel({
  probability,
  size = 340,
  arrowAngle = 0,
  spinning: _spinning = false,
  phase = 'idle',
  rollResult = null,
}: Props) {
  const uid = useId().replace(/:/g, '');
  const winPath = useMemo(() => winSectorPath(CX, CY, INNER, OUTER, probability), [probability]);
  const losePath = useMemo(() => loseSectorPath(CX, CY, INNER, OUTER, probability), [probability]);
  const ticks = useMemo(() => tickMarks(CX, CY, 182, 80, 5), []);
  const showPercentage = probability > 0 && phase !== 'win' && phase !== 'lose';
  const showResult = phase === 'win' || phase === 'lose';

  return (
    <div className="relative mx-auto gpu" style={{ width: size, height: size }}>
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${
          phase === 'win' ? 'bg-gold/25 blur-[50px]' : phase === 'lose' ? 'bg-risk/20 blur-[50px]' : 'bg-gold/8 blur-[40px]'
        }`}
        style={{ width: size * 0.95, height: size * 0.95 }}
      />

      {/* Static circle — never rotates */}
      <svg viewBox="0 0 400 400" className="h-full w-full drop-shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
        <defs>
          <linearGradient id={`wg_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="40%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
          <linearGradient id={`lg_${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#252a38" />
            <stop offset="100%" stopColor="#0f1219" />
          </linearGradient>
          <filter id={`glow_${uid}`}>
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle cx={CX} cy={CY} r={188} fill="none" stroke="#2a3040" strokeWidth="2" />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x} y1={t.y} x2={t.x2} y2={t.y2}
            stroke={t.major ? '#6a7080' : '#3a4050'} strokeWidth={t.major ? 2 : 1} />
        ))}

        {losePath && <path d={losePath} fill={`url(#lg_${uid})`} stroke="#1e222d" strokeWidth="1" />}
        {winPath && (
          <path d={winPath} fill={`url(#wg_${uid})`} filter={`url(#glow_${uid})`}>
            <animate attributeName="opacity" values="0.9;1;0.9" dur="2.5s" repeatCount="indefinite" />
          </path>
        )}

        <circle cx={CX} cy={CY} r={108} fill="none" stroke="#1a1e28" strokeWidth="12" strokeDasharray="4 6" />
        <circle cx={CX} cy={CY} r={88} fill="#0c0e14" stroke="#2a3040" strokeWidth="2" />

        {!showPercentage && (
          <g transform={`translate(${CX},${CY})`}>
            <path d="M-18 8 L0 -14 L18 8" fill="none" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
            <path d="M-18 22 L0 0 L18 22" fill="none" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
          </g>
        )}
      </svg>

      {showPercentage && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <motion.div
            key={probability}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display font-black text-gold drop-shadow-[0_0_16px_rgba(255,215,0,0.45)]"
            style={{ fontSize: size * 0.13 }}
          >
            {probability}<span className="text-[0.45em] opacity-70">%</span>
          </motion.div>
        </div>
      )}

      {/* Orbiting needle — small precise triangle (~5% of diameter) */}
      <div
        className="absolute inset-0 gpu origin-center"
        style={{ transform: `rotate(${arrowAngle}deg)` }}
      >
        <div
          className="absolute left-1/2 z-20 -translate-x-1/2"
          style={{ bottom: `${size * 0.028}px` }}
        >
          <svg
            width={size * 0.05}
            height={size * 0.045}
            viewBox="0 0 10 9"
            className="drop-shadow-[0_0_4px_rgba(255,149,0,0.9)]"
            aria-hidden="true"
          >
            <polygon points="5,0.8 0.6,8.2 9.4,8.2" fill="#FF9500" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {showResult && rollResult && (
          <WheelResultFx key={phase} phase={phase} size={size} rollResult={rollResult} />
        )}
      </AnimatePresence>
    </div>
  );
}
