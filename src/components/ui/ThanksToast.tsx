import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  show: boolean;
  onDismiss: () => void;
  durationMs?: number;
  title?: string;
  subtitle?: string;
  variant?: 'success' | 'error';
}

export function ThanksToast({
  show,
  onDismiss,
  durationMs = 5000,
  title = 'Thanks for playing',
  subtitle = 'Your withdrawal has been completed',
  variant = 'success',
}: Props) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!show) return;
    const id = window.setTimeout(() => onDismissRef.current(), durationMs);
    return () => window.clearTimeout(id);
  }, [show, durationMs]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-[200] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl ${
            variant === 'error'
              ? 'border-risk/45 bg-[#0c0e14]/95 shadow-[0_0_28px_rgba(255,82,82,0.15)]'
              : 'border-win/45 bg-[#0c0e14]/95 shadow-[0_0_28px_rgba(0,230,118,0.2)]'
          }`}
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg font-black shadow-[0_0_16px_rgba(0,0,0,0.2)] ${
            variant === 'error'
              ? 'border-risk/40 bg-risk/15 text-risk'
              : 'border-win/40 bg-win/15 text-win shadow-[0_0_16px_rgba(0,230,118,0.35)]'
          }`}
          >
            {variant === 'error' ? '!' : '✓'}
          </div>
          <div className="min-w-0">
            <p className={`font-display text-sm font-bold uppercase tracking-wide ${
              variant === 'error' ? 'text-risk' : 'text-win'
            }`}
            >
              {title}
            </p>
            <p className="text-[11px] text-white/45">{subtitle}</p>
            <motion.div
              aria-hidden="true"
              className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/10"
            >
              <motion.div
                className={`h-full origin-left rounded-full ${variant === 'error' ? 'bg-risk' : 'bg-win'}`}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: durationMs / 1000, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}