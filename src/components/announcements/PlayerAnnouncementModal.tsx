import { AnimatePresence, motion } from 'framer-motion';
import type { PlayerAnnouncement } from '../../lib/announcementApi';

interface Props {
  open: boolean;
  announcement: PlayerAnnouncement | null;
  onClose: () => void;
}

export function PlayerAnnouncementModal({ open, announcement, onClose }: Props) {
  if (!announcement) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[215] flex items-center justify-center p-4"
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
            aria-labelledby="player-announcement-title"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-sky-400/30 bg-[#101018] shadow-[0_0_60px_rgba(56,189,248,0.2)]"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-sky-400/20 bg-gradient-to-r from-sky-500/15 to-violet-500/10 px-5 py-4">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300/80">
                Notice
              </p>
              <h2
                id="player-announcement-title"
                className="mt-1 font-display text-xl font-black uppercase tracking-wide text-white"
              >
                {announcement.title}
              </h2>
            </div>

            <div className="px-5 py-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                {announcement.message}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 px-4 py-3 font-display text-xs font-black uppercase tracking-[0.12em] text-[#101010] transition hover:brightness-110"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
