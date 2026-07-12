import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigateFreeCase } from '../lib/appRoute';
import { canPlayerOpenFreeCase } from '../lib/freeCaseUnlock';
import { caseHasRoyalLoot } from '../lib/freeCaseRoyal';
import { FREE_CASE_TIERS, pathForFreeCaseSlug, slugForTier, type FreeCaseTier } from '../lib/freeCaseTiers';
import { useFreeCaseCooldown } from '../hooks/useFreeCaseCooldown';
import { FreeCasePortada } from '../components/freecases/FreeCaseCover';

function DiamondIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-violet-400" aria-hidden="true">
      <path d="M6 0 12 6 6 12 0 6Z" fill="currentColor" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-white/40" fill="currentColor" aria-hidden="true">
      <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm-.75 2.5a.75.75 0 0 1 1.5 0V10l2.2 1.3a.75.75 0 1 1-.75 1.3l-2.5-1.5A.75.75 0 0 1 9.25 10V6.5z" />
    </svg>
  );
}

function FreeCaseCard({
  tier,
  unlocked,
}: {
  tier: FreeCaseTier;
  unlocked: boolean;
}) {
  const slug = slugForTier(tier);
  const href = pathForFreeCaseSlug(slug);
  const { ready, timer } = useFreeCaseCooldown(slug);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!unlocked) return;
    navigateFreeCase(slug);
  };

  const linkClass =
    `block rounded-xl transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 ${
      unlocked
        ? 'cursor-pointer hover:scale-[1.02] hover:brightness-110'
        : 'cursor-not-allowed opacity-80'
    }`;

  return (
    <a
      href={href}
      onClick={handleClick}
      className={linkClass}
      aria-label={`View ${tier.name} case`}
    >
      <FreeCasePortada tier={tier} hasRoyalLoot={caseHasRoyalLoot(slug)} />

      <div
        className={`relative -mt-1 rounded-lg border px-3 py-2 text-center ${
          unlocked
            ? 'border-rose-500/55 bg-[#0a0812]/90'
            : 'border-white/[0.08] bg-[#0a0812]/70'
        }`}
      >
        {unlocked ? (
          ready ? (
            <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-win sm:text-sm">
              Ready to open
            </span>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <ClockIcon />
              <span className="font-display text-sm font-bold tabular-nums tracking-wider text-white/80">{timer}</span>
            </div>
          )
        ) : (
          <span className="font-display text-xs font-bold uppercase tracking-wide text-white/40 sm:text-sm">
            Level {tier.level}
          </span>
        )}
      </div>
    </a>
  );
}

function HowItWorksMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const steps = [
    { n: '1', title: 'Play', desc: 'Upgrade and play on BloxUpgrader to earn experience.' },
    { n: '2', title: 'Earn XP', desc: 'Each session grants XP based on your activity.' },
    { n: '3', title: 'Level up', desc: 'Accumulate XP to unlock new ranks.' },
    { n: '4', title: 'Get cases', desc: 'Each level unlocks a new daily free Bloxstrike case.' },
  ];

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="rounded-full border border-white/15 bg-[#141024]/80 px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/55 backdrop-blur-sm transition hover:border-violet-500/30 hover:text-violet-200"
      >
        How does it work?
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-30 mt-2 w-[min(calc(100vw-1.5rem),20rem)] -translate-x-1/2 rounded-xl border border-white/10 bg-[#141024]/95 p-4 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md sm:left-auto sm:right-0 sm:translate-x-0">
          <p className="mb-3 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-violet-300">
            How free cases work
          </p>
          <ul className="space-y-3">
            {steps.map(step => (
              <li key={step.n} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-500/35 bg-violet-500/15 font-display text-[10px] font-bold text-violet-200">
                  {step.n}
                </span>
                <div>
                  <p className="font-display text-xs font-bold uppercase tracking-wide text-white/85">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/50">{step.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function FreeCasesPage() {
  const { user } = useAuth();

  return (
    <div className="relative w-full overflow-hidden px-3 py-5 pb-24 sm:px-4 lg:px-6 xl:px-8">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-32 h-80 w-80 rounded-full bg-fuchsia-600/15 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-96 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[90px]" />

      <section className="relative mx-auto max-w-[1400px]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <DiamondIcon />
            <h1 className="font-display text-lg font-black uppercase tracking-wide text-white sm:text-xl lg:text-2xl">
              Open daily Bloxstrike cases every day
            </h1>
            <DiamondIcon />
          </div>

          <HowItWorksMenu />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {FREE_CASE_TIERS.map(tier => (
            <FreeCaseCard
              key={tier.level}
              tier={tier}
              unlocked={user ? canPlayerOpenFreeCase(user.userId, slugForTier(tier)) : false}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-white/35">
          Level up to unlock more daily cases. Rewards will be available soon.
        </p>
      </section>
    </div>
  );
}
