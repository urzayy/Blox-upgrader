import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ProbabilityWheel } from './ProbabilityWheel';
import { ProbControls } from './ProbControls';
import { computeFinalArrowAngle, resolveRoll, type RollResult } from '../../lib/wheelMath';
import { sfx, WheelSpinAudio } from '../../lib/audio';

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
  onUpgradeStart?: () => void;
  onUpgradeRollLocked?: (roll: RollResult) => void;
  onComplete: (won: boolean, roll: RollResult) => void;
}

type Phase = 'idle' | 'spin' | 'win' | 'lose';

export function UpgradeEngine({
  probability, wheelSize, multiplier, cap,
  canUpgrade, requiresLogin, onLoginRequired, turbo, onMultiplier, onCap,
  onUpgradeStart, onUpgradeRollLocked, onComplete,
}: Props) {
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

    onUpgradeStart?.();
    const result = resolveRoll(probability);
    onUpgradeRollLocked?.(result);
    setSpinning(true);
    setPhase('spin');
    setRollResult(null);
    sfx.upgradeStart();
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

  return (
    <section className="relative flex w-full max-w-[400px] shrink-0 flex-col items-center px-2">
      <div className={`transition-all duration-300 ${phase === 'win' ? 'scale-105' : phase === 'lose' ? 'animate-wheel-shake' : ''}`}>
        <ProbabilityWheel
          probability={probability}
          size={wheelSize}
          arrowAngle={arrowAngle}
          spinning={spinning}
          phase={phase}
          rollResult={rollResult}
        />
      </div>

      <ProbControls multiplier={multiplier} cap={cap} onMultiplier={onMultiplier} onCap={onCap} />

      <motion.button
        type="button"
        disabled={!canUpgrade || spinning}
        onClick={runUpgrade}
        whileHover={canUpgrade && !spinning ? { scale: 1.02, boxShadow: '0 0 40px rgba(255,204,0,0.35)' } : {}}
        whileTap={canUpgrade && !spinning ? { scale: 0.98 } : {}}
        className="mt-3 w-full max-w-[280px] rounded-xl bg-[#ffcc00] py-3.5 font-display text-base font-black tracking-wide text-black uppercase shadow-[0_4px_24px_rgba(255,204,0,0.35)] disabled:opacity-30 disabled:shadow-none"
      >
        {spinning ? 'ROLLING...' : requiresLogin && canUpgrade ? 'Inicia sesión' : 'UPGRADE'}
      </motion.button>
    </section>
  );
}
