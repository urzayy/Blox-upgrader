import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ProbabilityWheel } from './ProbabilityWheel';
import { ProbControls } from './ProbControls';
import { computeFinalArrowAngle, resolveRoll, type RollResult } from '../../lib/wheelMath';
import { sfx, WheelSpinAudio } from '../../lib/audio';

export interface UpgradeEngineHandle {
  runUpgrade: () => void;
  spinning: boolean;
}

interface Props {
  probability: number;
  wheelSize: number;
  multiplier: number | null;
  cap: number | null;
  canUpgrade: boolean;
  requiresLogin?: boolean;
  onLoginRequired?: () => void;
  turbo: boolean;
  onMultiplier: (m: number) => void;
  onCap: (c: number) => void;
  onUpgradeStart?: () => boolean | void;
  onUpgradeRollLocked?: (roll: RollResult) => void;
  onComplete: (won: boolean, roll: RollResult) => void;
  showUpgradeButton?: boolean;
  showControls?: boolean;
  riskyLabel?: boolean;
}

type Phase = 'idle' | 'spin' | 'win' | 'lose';

export const UpgradeEngine = forwardRef<UpgradeEngineHandle, Props>(function UpgradeEngine({
  probability,
  wheelSize,
  multiplier,
  cap,
  canUpgrade,
  requiresLogin,
  onLoginRequired,
  turbo,
  onMultiplier,
  onCap,
  onUpgradeStart,
  onUpgradeRollLocked,
  onComplete,
  showUpgradeButton = true,
  showControls = true,
  riskyLabel = false,
}, ref) {
  const [arrowAngle, setArrowAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [rollResult, setRollResult] = useState<RollResult | null>(null);
  const arrowRef = useRef(0);
  const spinAudioRef = useRef(new WheelSpinAudio());

  const runUpgrade = useCallback(() => {
    if (spinning || probability <= 0) return;

    if (requiresLogin) {
      onLoginRequired?.();
      return;
    }

    const started = onUpgradeStart?.();
    if (started === false) return;

    const result = resolveRoll(probability);
    onUpgradeRollLocked?.(result);
    setSpinning(true);
    setPhase('spin');
    setRollResult(null);
    sfx.upgradeStart(turbo);
    spinAudioRef.current.reset(arrowRef.current);

    const { finalArrow } = computeFinalArrowAngle(arrowRef.current, probability, result.won);
    const anim = { val: arrowRef.current };
    const spinDuration = turbo ? 1.1 + Math.random() * 0.35 : 4.5 + Math.random() * 1.5;
    const resultDelay = turbo ? 650 : 2800;

    gsap.to(anim, {
      val: finalArrow,
      duration: spinDuration,
      ease: turbo ? 'power3.out' : 'power4.out',
      onUpdate: () => {
        arrowRef.current = anim.val;
        setArrowAngle(anim.val);
        spinAudioRef.current.update(anim.val, turbo);
      },
      onComplete: () => {
        spinAudioRef.current.finish();
        arrowRef.current = finalArrow;
        setArrowAngle(finalArrow);
        setSpinning(false);
        setRollResult(result);
        setPhase(result.won ? 'win' : 'lose');
        result.won ? sfx.win() : sfx.lose();
        onComplete(result.won, result);
        setTimeout(() => {
          setPhase('idle');
          setRollResult(null);
        }, resultDelay);
      },
    });
  }, [probability, spinning, turbo, onComplete, onUpgradeStart, onUpgradeRollLocked, requiresLogin, onLoginRequired]);

  useImperativeHandle(ref, () => ({ runUpgrade, spinning }), [runUpgrade, spinning]);

  return (
    <section className="relative flex w-full max-w-[400px] shrink-0 flex-col items-center px-1 sm:px-2 max-lg:max-w-full">
      <motion.div
        className="relative w-full"
        animate={
          phase === 'win'
            ? {
                scale: [1, 1.08, 1.04, 1.06],
                rotate: [0, 1.5, -0.5, 0],
                filter: ['brightness(1)', 'brightness(1.35)', 'brightness(1.15)', 'brightness(1.2)'],
              }
            : phase === 'lose'
              ? {
                  scale: [1, 0.96, 0.99, 1],
                  x: [0, -10, 10, -6, 6, -3, 0],
                  rotate: [0, -2, 2, -1, 0],
                  filter: ['brightness(1)', 'brightness(0.55)', 'brightness(0.75)', 'brightness(1)'],
                }
              : { scale: 1, x: 0, rotate: 0, filter: 'brightness(1)' }
        }
        transition={
          phase === 'lose'
            ? { duration: 0.65, ease: 'easeOut' }
            : phase === 'win'
              ? { duration: 0.75, ease: 'easeOut' }
              : { duration: 0.3 }
        }
      >
        <ProbabilityWheel
          probability={probability}
          size={wheelSize}
          arrowAngle={arrowAngle}
          spinning={spinning}
          phase={phase}
          rollResult={rollResult}
          showRiskyLabel={riskyLabel}
        />
      </motion.div>

      {showControls && (
        <ProbControls multiplier={multiplier} cap={cap} onMultiplier={onMultiplier} onCap={onCap} />
      )}

      {showUpgradeButton && (
        <motion.button
          type="button"
          disabled={!canUpgrade || spinning}
          onClick={runUpgrade}
          whileHover={canUpgrade && !spinning ? { scale: 1.02, boxShadow: '0 0 40px rgba(176,108,255,0.4)' } : {}}
          whileTap={canUpgrade && !spinning ? { scale: 0.98 } : {}}
          className="mt-2 w-full max-w-[280px] rounded-xl bg-gradient-to-r from-[#9333ea] via-[#b56bff] to-[#a855f7] py-3 font-display text-sm font-black tracking-wide text-white uppercase shadow-[0_4px_24px_rgba(176,108,255,0.35)] disabled:opacity-30 disabled:shadow-none max-lg:max-w-none max-lg:py-2.5 max-lg:text-xs"
        >
          {spinning ? 'ROLLING...' : requiresLogin && canUpgrade ? 'Inicia sesión' : 'UPGRADE'}
        </motion.button>
      )}
    </section>
  );
});
