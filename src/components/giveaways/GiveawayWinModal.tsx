import { AnimatePresence, motion } from 'framer-motion';
import type { Skin } from '../../data/skins';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from '../skins/SkinImage';
import { splitSkinDisplayName } from '../../lib/giveaways';
import type { GiveawayPeriod } from '../../lib/giveaways';

const PERIOD_LABELS: Record<GiveawayPeriod, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

interface Props {
  open: boolean;
  skin: Skin | null;
  period: GiveawayPeriod | null;
  onClose: () => void;
}

export function GiveawayWinModal({ open, skin, period, onClose }: Props) {
  if (!skin) return null;
  const { weaponLabel, skinName } = splitSkinDisplayName(skin.name);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[220] flex items-center justify-center p-4"
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
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-400/35 bg-[#101018] shadow-[0_0_60px_rgba(245,158,11,0.25)]"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-amber-400/20 bg-gradient-to-r from-amber-500/15 to-violet-500/10 px-5 py-4 text-center">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/80">
                Congratulations!
              </p>
              <h2 className="mt-1 font-display text-xl font-black uppercase tracking-wide text-white">
                You won the giveaway
              </h2>
              {period && (
                <p className="mt-1 text-xs uppercase tracking-wide text-white/45">
                  {PERIOD_LABELS[period]} giveaway
                </p>
              )}
            </div>

            <div className="flex flex-col items-center px-5 py-6">
              <div className="mb-4 flex h-36 w-full items-center justify-center rounded-xl border border-white/10 bg-[#141024]/80">
                <SkinImage src={skin.image} alt={skin.name} zoom={1.15} />
              </div>
              <p className="font-display text-[10px] font-bold uppercase tracking-wide text-white/40">
                {weaponLabel} | {skin.wear}
              </p>
              <p className="mt-1 font-display text-lg font-black uppercase tracking-wide text-white">
                {skinName}
              </p>
              <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-1.5">
                <CoinPrice
                  value={skin.price}
                  iconClassName="h-4 w-4"
                  textClassName="font-display text-sm font-bold text-amber-300"
                />
              </div>
              <p className="mt-4 text-center text-xs leading-relaxed text-white/50">
                The prize has been added to your inventory automatically.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 font-display text-xs font-black uppercase tracking-[0.12em] text-[#101010] transition hover:brightness-110"
              >
                Great!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
