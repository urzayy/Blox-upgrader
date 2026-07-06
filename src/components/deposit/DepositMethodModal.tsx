import { motion, AnimatePresence } from 'framer-motion';
import { DEPOSIT_SKINS_ICON, ROBUX_DEPOSIT_ICON } from '../../lib/devRobuxDeposit';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectRobux: () => void;
  onSelectSkins: () => void;
}

export function DepositMethodModal({ open, onClose, onSelectRobux, onSelectSkins }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[125] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deposit-method-title"
            className="relative w-full max-w-lg rounded-2xl border border-gold/25 bg-[#0e1018] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <h2
              id="deposit-method-title"
              className="text-center font-display text-lg font-bold uppercase tracking-wide text-gold"
            >
              Deposit
            </h2>
            <p className="mt-2 text-center text-sm text-white/45">
              Choose how you want to deposit
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectRobux();
                }}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-win/30 bg-win/5 px-4 py-6 transition hover:border-win/50 hover:bg-win/10"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-win/20 bg-black/30 p-3 shadow-[0_0_24px_rgba(52,211,153,0.15)]">
                  <img
                    src={ROBUX_DEPOSIT_ICON}
                    alt=""
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                </div>
                <span className="font-display text-base font-black uppercase tracking-wide text-win">
                  Robux
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectSkins();
                }}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-gold/30 bg-gold/5 px-4 py-6 transition hover:border-gold/50 hover:bg-gold/10"
              >
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-gold/20 bg-black/30 p-2 shadow-[0_0_24px_rgba(255,215,0,0.12)]">
                  <img
                    src={DEPOSIT_SKINS_ICON}
                    alt=""
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                </div>
                <span className="font-display text-base font-black uppercase tracking-wide text-gold">
                  Con skins
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-lg border border-white/10 py-2 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
