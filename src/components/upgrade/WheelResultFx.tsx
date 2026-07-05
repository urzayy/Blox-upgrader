import { motion } from 'framer-motion';
import { formatRoll, type RollResult } from '../../lib/wheelMath';

interface Props {
  phase: 'win' | 'lose';
  size: number;
  rollResult: RollResult;
}

const SPARKS = Array.from({ length: 12 }, (_, i) => ({
  angle: (i / 12) * 360,
  delay: i * 0.04,
}));

export function WheelResultFx({ phase, size, rollResult }: Props) {
  const win = phase === 'win';
  const accent = win ? '#FFD700' : '#FF4757';
  const glow = win ? 'rgba(255,215,0,0.55)' : 'rgba(255,71,87,0.45)';

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: size * 0.35,
            height: size * 0.35,
            borderColor: win ? 'rgba(255,215,0,0.5)' : 'rgba(255,71,87,0.35)',
          }}
          initial={{ scale: 0.4, opacity: 0.8 }}
          animate={{ scale: 1.35 + i * 0.22, opacity: 0 }}
          transition={{ duration: 0.9 + i * 0.15, delay: i * 0.12, ease: 'easeOut' }}
        />
      ))}

      {win && SPARKS.map(({ angle, delay }) => (
        <motion.span
          key={angle}
          className="absolute h-1 w-1 rounded-full bg-gold"
          style={{ boxShadow: `0 0 8px ${glow}` }}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.2, 0],
            x: Math.cos((angle * Math.PI) / 180) * size * 0.28,
            y: Math.sin((angle * Math.PI) / 180) * size * 0.28,
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 0.75, delay, ease: 'easeOut' }}
        />
      ))}

      <motion.div
        className="relative flex flex-col items-center justify-center gap-0.5 text-center"
        style={{ width: size * 0.42 }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22, delay: 0.05 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.span
          className={`relative font-display font-black tabular-nums leading-none ${win ? 'text-gold' : 'text-risk'}`}
          style={{ fontSize: size * 0.075 }}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
        >
          {formatRoll(rollResult.roll)}
        </motion.span>
        <motion.span
          className="relative font-display text-[9px] tabular-nums text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          0 – {formatRoll(rollResult.winMax)}
        </motion.span>
      </motion.div>

      <motion.span
        className="absolute rounded-full"
        style={{
          width: size * 0.55,
          height: size * 0.55,
          border: `1px dashed ${accent}44`,
        }}
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: win ? 180 : -120, opacity: [0, 0.6, 0.3] }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      />
    </motion.div>
  );
}
