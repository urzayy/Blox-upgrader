import { motion } from 'framer-motion';
import { formatRoll, type RollResult } from '../../lib/wheelMath';

interface Props {
  phase: 'win' | 'lose';
  size: number;
  rollResult: RollResult;
}

const SPARKS = Array.from({ length: 16 }, (_, i) => ({
  angle: (i / 16) * 360,
  delay: i * 0.03,
  dist: 0.24 + (i % 3) * 0.04,
}));

const WIN_RAYS = Array.from({ length: 8 }, (_, i) => ({
  angle: i * 45,
  delay: 0.05 + i * 0.04,
}));

const LOSS_SHARDS = Array.from({ length: 14 }, (_, i) => ({
  angle: -90 + (i - 7) * 14,
  delay: 0.04 + i * 0.035,
  drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 6),
}));

export function WheelResultFx({ phase, size, rollResult }: Props) {
  const win = phase === 'win';
  const glow = 'rgba(176,108,255,0.5)';

  if (win) {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-[6%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.35) 0%, transparent 68%)' }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: [0, 1, 0.65], scale: [0.7, 1.15, 1.05] }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />

        <motion.div
          className="absolute inset-[10%] rounded-full"
          style={{ boxShadow: 'inset 0 0 50px rgba(216,180,254,0.35)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.45] }}
          transition={{ duration: 0.65 }}
        />

        {[0, 1, 2, 3].map(i => (
          <motion.span
            key={`burst-${i}`}
            className="absolute rounded-full border-2 border-[#e879f9]/50"
            style={{ width: size * (0.28 + i * 0.08), height: size * (0.28 + i * 0.08) }}
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 1.5 + i * 0.18, opacity: 0 }}
            transition={{ duration: 0.75 + i * 0.14, delay: i * 0.1, ease: 'easeOut' }}
          />
        ))}

        {WIN_RAYS.map(({ angle, delay }) => (
          <motion.span
            key={`ray-${angle}`}
            className="absolute origin-center bg-gradient-to-t from-transparent via-[#d8b4fe]/60 to-transparent"
            style={{
              width: 2,
              height: size * 0.34,
              rotate: `${angle}deg`,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [0, 1, 0.6], opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.7, delay, ease: 'easeOut' }}
          />
        ))}

        {SPARKS.map(({ angle, delay, dist }) => (
          <motion.span
            key={`spark-${angle}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-[#f0abfc]"
            style={{ boxShadow: '0 0 10px rgba(240,171,252,0.8)' }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.4, 0.4, 0],
              x: Math.cos((angle * Math.PI) / 180) * size * dist,
              y: Math.sin((angle * Math.PI) / 180) * size * dist,
              opacity: [0, 1, 0.8, 0],
            }}
            transition={{ duration: 0.9, delay, ease: 'easeOut' }}
          />
        ))}

        <motion.span
          className="absolute font-display text-[#c084fc]/20"
          style={{ fontSize: size * 0.5, fontWeight: 900 }}
          initial={{ scale: 0.4, opacity: 0, rotate: 0 }}
          animate={{ scale: [0.4, 1.1, 1], opacity: [0, 0.4, 0.2], rotate: [0, 12, 8] }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          ✦
        </motion.span>

        <motion.div
          className="relative flex flex-col items-center justify-center gap-1 text-center"
          style={{ width: size * 0.46 }}
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 460, damping: 20, delay: 0.06 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.6, 1, 0.7] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.span
            className="relative font-display text-[10px] font-black uppercase tracking-[0.35em] text-[#f0abfc]"
            style={{ textShadow: '0 0 20px rgba(240,171,252,0.7)' }}
            initial={{ y: 12, opacity: 0, scale: 0.8 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: [0.8, 1.12, 1],
              letterSpacing: ['0.2em', '0.38em', '0.35em'],
            }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            Won
          </motion.span>

          <motion.span
            className="relative font-display font-black tabular-nums leading-none text-[#faf5ff]"
            style={{
              fontSize: size * 0.08,
              textShadow: '0 0 28px rgba(216,180,254,0.85), 0 0 48px rgba(168,85,247,0.45)',
            }}
            initial={{ y: 10, opacity: 0, scale: 0.85 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: [0.85, 1.08, 1],
            }}
            transition={{ delay: 0.12, duration: 0.45, ease: 'easeOut' }}
          >
            {formatRoll(rollResult.roll)}
          </motion.span>

          <motion.span
            className="relative font-display text-[9px] tabular-nums text-[#d8b4fe]/80"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            0 – {formatRoll(rollResult.winMax)}
          </motion.span>
        </motion.div>

        <motion.span
          className="absolute rounded-full border border-dashed border-[#e879f9]/40"
          style={{ width: size * 0.58, height: size * 0.58 }}
          initial={{ rotate: 0, opacity: 0, scale: 0.85 }}
          animate={{ rotate: 220, opacity: [0, 0.55, 0.3], scale: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-[8%] rounded-full bg-[#12081f]"
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: [0, 0.55, 0.3], scale: [1.15, 1, 1.02] }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      />

      <motion.div
        className="absolute inset-[12%] rounded-full"
        style={{ boxShadow: 'inset 0 0 60px rgba(88,28,135,0.45)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0.5] }}
        transition={{ duration: 0.7 }}
      />

      {[0, 1, 2].map(i => (
        <motion.span
          key={`collapse-${i}`}
          className="absolute rounded-full border border-[#7c3aed]/40"
          style={{ width: size * (0.5 - i * 0.06), height: size * (0.5 - i * 0.06) }}
          initial={{ scale: 1.25 + i * 0.08, opacity: 0.5 }}
          animate={{ scale: 0.72, opacity: 0 }}
          transition={{ duration: 0.65 + i * 0.12, delay: i * 0.08, ease: 'easeIn' }}
        />
      ))}

      {LOSS_SHARDS.map(({ angle, delay, drift }) => {
        const rad = (angle * Math.PI) / 180;
        const burst = size * 0.22;
        return (
          <motion.span
            key={`shard-${angle}-${delay}`}
            className="absolute h-1.5 w-1.5 rotate-45 bg-[#c084fc]"
            style={{ boxShadow: '0 0 6px rgba(192,132,252,0.6)' }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: [
                Math.cos(rad) * burst * 0.35,
                Math.cos(rad) * burst * 0.55 + drift,
                Math.cos(rad) * burst * 0.2 + drift * 1.4,
              ],
              y: [
                Math.sin(rad) * burst * 0.35,
                Math.sin(rad) * burst * 0.55 + size * 0.08,
                Math.sin(rad) * burst * 0.2 + size * 0.18,
              ],
              opacity: [0, 0.9, 0],
              scale: [0, 1, 0.3],
              rotate: [45, 45 + drift * 2, 90],
            }}
            transition={{ duration: 0.85, delay, ease: 'easeOut' }}
          />
        );
      })}

      <motion.div
        className="relative flex flex-col items-center justify-center gap-1 text-center"
        style={{ width: size * 0.46 }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 0.08 }}
      >
        <motion.span
          className="relative font-display text-[10px] font-black uppercase tracking-[0.35em] text-[#9333ea]"
          style={{ textShadow: '0 0 16px rgba(147,51,234,0.5)' }}
          initial={{ y: -10, opacity: 0, letterSpacing: '0.5em' }}
          animate={{
            y: 0,
            opacity: [0, 1, 0.75],
            letterSpacing: ['0.5em', '0.35em', '0.35em'],
            scale: [1.15, 0.96, 1],
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Missed
        </motion.span>

        <motion.span
          className="relative font-display font-black tabular-nums leading-none text-[#d8b4fe]"
          style={{ fontSize: size * 0.075, textShadow: '0 0 24px rgba(192,132,252,0.45)' }}
          initial={{ y: 6, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            x: [0, -3, 3, -2, 1, 0],
          }}
          transition={{
            y: { delay: 0.15, duration: 0.35 },
            opacity: { delay: 0.15, duration: 0.35 },
            x: { delay: 0.2, duration: 0.45 },
          }}
        >
          {formatRoll(rollResult.roll)}
        </motion.span>

        <motion.span
          className="relative font-display text-[9px] tabular-nums text-[#a78bfa]/60"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          0 – {formatRoll(rollResult.winMax)}
        </motion.span>
      </motion.div>

      <motion.span
        className="absolute font-display text-[#581c87]/25"
        style={{ fontSize: size * 0.55, fontWeight: 900 }}
        initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: [0, 0.35, 0.15], rotate: -8 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        ×
      </motion.span>
    </motion.div>
  );
}
