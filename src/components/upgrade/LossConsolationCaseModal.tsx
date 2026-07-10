import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CaseReelItem, LossConsolationResult } from '../../lib/lossConsolationCase';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from '../skins/SkinImage';
import { sfx } from '../../lib/audio';

interface Props {
  open: boolean;
  lostValue: number;
  inputLabel: string;
  result: LossConsolationResult;
  turbo: boolean;
  onComplete: () => void;
}

function ReelSelector({ active }: { active: boolean }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-28 bg-gradient-to-r from-[#0c0e14] via-[#0c0e14]/95 to-transparent sm:w-36" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-28 bg-gradient-to-l from-[#0c0e14] via-[#0c0e14]/95 to-transparent sm:w-36" />

      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center">
        <motion.div
          animate={active ? { y: [0, 3, 0], opacity: [0.85, 1, 0.85] } : { opacity: 0.7 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="18" height="11" viewBox="0 0 18 11" aria-hidden="true" className="drop-shadow-[0_0_10px_rgba(255,215,0,0.45)]">
            <path d="M9 10 L1.5 1.5 L16.5 1.5 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="0.75" />
          </svg>
        </motion.div>

        <motion.div
          className="mt-0.5 w-px flex-1 bg-gradient-to-b from-gold/70 via-gold/30 to-gold/70"
          animate={{ opacity: active ? [0.35, 0.75, 0.35] : 0.3 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </>
  );
}

const ITEM_WIDTH = 112;
const ITEM_GAP = 10;
const ITEM_CENTER = ITEM_WIDTH / 2;
const ITEM_STRIDE = ITEM_WIDTH + ITEM_GAP;

function ReelCard({ item, highlight }: { item: CaseReelItem; highlight?: boolean }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border bg-[#141820] transition ${
        highlight
          ? 'border-gold ring-2 ring-gold/50 shadow-[0_0_28px_rgba(255,215,0,0.35)]'
          : item.isJackpot
            ? 'border-gold/35 shadow-[0_0_14px_rgba(255,215,0,0.15)]'
            : 'border-white/10'
      }`}
      style={{ width: ITEM_WIDTH }}
    >
      {item.isJackpot && (
        <span className="absolute left-1 top-1 z-10 rounded bg-gold/15 px-1 py-0.5 text-[7px] font-black uppercase text-gold">
          Nice
        </span>
      )}
      <div className="absolute right-1 top-1 z-10 rounded bg-black/80 px-1 py-0.5">
        <CoinPrice
          value={item.displayPrice}
          iconClassName="h-2 w-2"
          textClassName="text-[7px] font-bold text-gold font-display"
        />
      </div>
      <div className="relative mx-auto aspect-square w-full max-h-[72px] p-1.5">
        <SkinImage src={item.skin.image} alt={item.skin.name} zoom={1.05} />
      </div>
      <p className="line-clamp-2 border-t border-white/5 bg-black/50 px-1.5 py-1 text-[8px] font-semibold leading-tight text-white/85">
        {item.skin.name}
      </p>
    </div>
  );
}

const ROLL_MS = 4200;
const AUTO_COLLECT_MS = 500;
const TURBO_REVEAL_MS = 500;

function TurboConsolationReveal({ result }: { result: LossConsolationResult }) {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="pointer-events-none relative w-full max-w-xs overflow-hidden rounded-2xl border border-gold/35 bg-[#0c0e14]/95 px-4 py-4 shadow-[0_16px_48px_rgba(0,0,0,0.75),0_0_24px_rgba(255,215,0,0.12)] backdrop-blur-md"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
    >
      <p className="text-center font-display text-[10px] font-bold uppercase tracking-[0.18em] text-gold/80">
        Consolation
      </p>
      <div className="relative mx-auto mt-3 aspect-square w-24 overflow-hidden rounded-xl border border-gold/30 bg-[#141820]">
        <SkinImage src={result.rewardSkin.image} alt={result.rewardSkin.name} zoom={1.08} />
      </div>
      <p className="mt-3 line-clamp-2 text-center font-display text-xs font-bold uppercase text-white">
        {result.rewardSkin.name}
      </p>
      <CoinPrice
        value={result.rewardSkin.price}
        iconClassName="mx-auto mt-1 h-3.5 w-3.5"
        textClassName="font-display text-sm font-black text-gold"
        className="mt-1 justify-center"
      />
    </motion.div>
  );
}

export function LossConsolationCaseModal({
  open,
  result,
  turbo,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<'intro' | 'rolling' | 'reveal'>('intro');
  const [offset, setOffset] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const collectedRef = useRef(false);
  onCompleteRef.current = onComplete;

  const targetOffset = useMemo(() => {
    const jitter = Math.random() * 10 - 5;
    return result.winIndex * ITEM_STRIDE + jitter;
  }, [result.winIndex]);

  useEffect(() => {
    if (!open) {
      collectedRef.current = false;
      if (!turbo) {
        setPhase('intro');
        setOffset(0);
      }
      return;
    }

    const finish = () => {
      if (collectedRef.current) return;
      collectedRef.current = true;
      onCompleteRef.current();
    };

    if (turbo) {
      sfx.win();
      const collectTimer = window.setTimeout(finish, TURBO_REVEAL_MS);
      return () => window.clearTimeout(collectTimer);
    }

    setPhase('intro');
    setOffset(0);

    const introTimer = window.setTimeout(() => {
      setPhase('rolling');
      sfx.upgradeStart();
    }, 900);

    const rollTimer = window.setTimeout(() => {
      setOffset(targetOffset);
    }, 950);

    const revealTimer = window.setTimeout(() => {
      setPhase('reveal');
      sfx.win();
    }, 950 + ROLL_MS);

    const collectTimer = window.setTimeout(finish, 950 + ROLL_MS + AUTO_COLLECT_MS);

    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(rollTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(collectTimer);
    };
  }, [open, targetOffset, turbo]);

  return (
    <AnimatePresence>
      {open && (
        turbo ? (
          <motion.div
            className="fixed inset-0 z-[140] flex items-end justify-center p-4 pb-8 sm:items-center sm:pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TurboConsolationReveal result={result} />
          </motion.div>
        ) : (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gold/25 bg-[#0c0e14] shadow-[0_24px_80px_rgba(0,0,0,0.85),0_0_40px_rgba(255,215,0,0.08)]"
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
          >
            <div className="border-b border-white/10 px-4 py-3 text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-risk">
                Upgrade failed
              </p>
              <h2 className="mt-1 font-display text-lg font-black uppercase text-gold">
                Consolation case
              </h2>
            </div>

            <div className="relative px-4 py-5">
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 py-3">
                <ReelSelector active={phase === 'reveal'} />

                <div
                  className="flex"
                  style={{
                    paddingLeft: `calc(50% - ${ITEM_CENTER}px)`,
                    gap: ITEM_GAP,
                    transform: `translateX(-${offset}px)`,
                    transition: phase === 'rolling' || phase === 'reveal'
                      ? 'transform 4s cubic-bezier(0.12, 0.85, 0.15, 1)'
                      : 'none',
                  }}
                >
                  {result.reel.map((item, index) => (
                    <ReelCard
                      key={`${item.skin.id}-${index}`}
                      item={item}
                      highlight={phase !== 'intro' && index === result.winIndex && phase !== 'rolling'}
                    />
                  ))}
                </div>
              </div>

              {phase === 'reveal' ? (
                <motion.div
                  className="mt-4 text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-display text-sm font-bold uppercase text-win">
                    You received: {result.rewardSkin.name}
                  </p>
                  <CoinPrice
                    value={result.rewardSkin.price}
                    iconClassName="mx-auto mt-1 h-4 w-4"
                    textClassName="font-display text-base font-black text-gold"
                    className="mt-1 justify-center"
                  />
                </motion.div>
              ) : (
                <p className="mt-4 text-center text-[11px] text-white/40">
                  {phase === 'intro' ? 'Opening case…' : 'Rolling…'}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
        )
      )}
    </AnimatePresence>
  );
}
