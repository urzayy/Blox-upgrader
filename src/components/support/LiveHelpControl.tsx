import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LiveHelpButton } from './LiveHelpButton';

interface Props {
  onConfirm: () => void;
  loading?: boolean;
}

export function LiveHelpControl({ onConfirm, loading }: Props) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <div className="relative shrink-0">
      <LiveHelpButton
        onClick={() => {
          if (loading) return;
          setOpen(prev => !prev);
        }}
        loading={loading}
      />

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label="Close help menu"
              className="fixed inset-0 z-[115]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="live-help-confirm-title"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="absolute bottom-full right-0 z-[116] mb-2 w-[min(92vw,300px)] rounded-xl border border-win/30 bg-[#0e1412] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.75),0_0_24px_rgba(52,211,153,0.12)]"
            >
              <h3
                id="live-help-confirm-title"
                className="font-display text-xs font-bold uppercase tracking-wide text-win"
              >
                Need help?
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-white/55">
                Only open chat if you have a real question or a specific issue.
                This helps admins assist everyone quickly. Please don't
                waste the team's time.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirm}
                  className="flex-1 rounded-lg border border-win/40 bg-win/15 px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wide text-win transition hover:bg-win/25 disabled:cursor-wait disabled:opacity-50"
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wide text-white/70 transition hover:border-white/25 hover:bg-white/10 disabled:opacity-50"
                >
                  No
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
