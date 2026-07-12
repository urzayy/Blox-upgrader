import { useState, type ReactNode } from 'react';

interface Props {
  title?: string;
  variant?: 'default' | 'fifty-fifty' | 'high-risk' | 'low-risk' | 'battles' | 'mixed';
  sectionId?: string;
  children?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function LineCap({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-2.5 w-2.5 shrink-0 text-violet-300/80 sm:h-3 sm:w-3 ${flip ? 'scale-x-[-1]' : ''}`}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M6 1 11 6 6 11 1 6Z"
        opacity="0.9"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        d="M6 3 9 6 6 9 3 6Z"
        opacity="0.45"
      />
    </svg>
  );
}

function HalfOrnamentLine({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';

  return (
    <div
      className={`flex w-full min-w-0 items-center gap-1.5 sm:gap-2 ${
        isLeft ? '' : 'flex-row-reverse'
      }`}
    >
      <LineCap flip={!isLeft} />
      <div className="relative h-3 min-w-0 flex-1">
        <div
          className={`absolute top-1/2 h-[2px] w-full -translate-y-1/2 ${
            isLeft
              ? 'bg-gradient-to-r from-violet-500/10 via-violet-300/55 to-fuchsia-300/75'
              : 'bg-gradient-to-l from-violet-500/10 via-violet-300/55 to-fuchsia-300/75'
          }`}
        />
        <div
          className={`absolute top-1/2 h-px w-full -translate-y-1/2 blur-[0.5px] ${
            isLeft
              ? 'bg-gradient-to-r from-transparent via-white/50 to-violet-200/35'
              : 'bg-gradient-to-l from-transparent via-white/50 to-violet-200/35'
          }`}
        />
        <div className="absolute inset-x-1 top-1/2 flex -translate-y-1/2 items-center justify-between opacity-35">
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className="block w-px bg-gradient-to-b from-transparent via-violet-200/80 to-transparent"
              style={{ height: i % 2 === 0 ? '6px' : '4px' }}
            />
          ))}
        </div>
      </div>
      <span
        className="h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] bg-gradient-to-br from-violet-200/90 to-fuchsia-400/50 shadow-[0_0_8px_rgba(167,139,250,0.65)]"
        aria-hidden="true"
      />
    </div>
  );
}

function FiftyFiftyTitle() {
  return (
    <div className="relative shrink-0 px-3 sm:px-5">
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.22),transparent_72%)] blur-md"
        aria-hidden="true"
      />
      <h2 className="relative flex items-center justify-center gap-0 font-display text-xl font-black leading-none tabular-nums tracking-tight sm:text-2xl">
        <span
          className="bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(251,191,36,0.45)]"
          style={{ WebkitTextStroke: '1px rgba(251,191,36,0.12)' }}
        >
          50
        </span>
        <span className="relative mx-0.5 px-0.5 text-base font-black leading-none text-white/35 sm:mx-1 sm:text-lg">
          <span className="absolute inset-0 blur-[3px] text-violet-300/40" aria-hidden="true">
            /
          </span>
          <span className="relative bg-gradient-to-b from-white/80 to-violet-200/50 bg-clip-text text-transparent">
            /
          </span>
        </span>
        <span
          className="bg-gradient-to-b from-cyan-100 via-violet-200 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(139,92,246,0.45)]"
          style={{ WebkitTextStroke: '1px rgba(139,92,246,0.12)' }}
        >
          50
        </span>
      </h2>
    </div>
  );
}

function HighRiskTitle() {
  return (
    <div className="relative shrink-0 px-3 sm:px-5">
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.2),transparent_72%)] blur-md"
        aria-hidden="true"
      />
      <h2 className="relative font-display text-sm font-black uppercase leading-none tracking-[0.24em] sm:text-base">
        <span className="bg-gradient-to-b from-rose-100 via-red-300 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(239,68,68,0.45)]">
          High
        </span>
        <span className="mx-1.5 bg-gradient-to-b from-orange-100 via-amber-300 to-orange-600 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(249,115,22,0.4)]">
          Risk
        </span>
      </h2>
    </div>
  );
}

function HighRiskOrnamentLine({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';

  return (
    <div
      className={`flex w-full min-w-0 items-center gap-1.5 sm:gap-2 ${
        isLeft ? '' : 'flex-row-reverse'
      }`}
    >
      <LineCap flip={!isLeft} />
      <div className="relative h-3 min-w-0 flex-1">
        <div
          className={`absolute top-1/2 h-[2px] w-full -translate-y-1/2 ${
            isLeft
              ? 'bg-gradient-to-r from-red-500/10 via-red-400/55 to-orange-400/75'
              : 'bg-gradient-to-l from-red-500/10 via-red-400/55 to-orange-400/75'
          }`}
        />
        <div
          className={`absolute top-1/2 h-px w-full -translate-y-1/2 blur-[0.5px] ${
            isLeft
              ? 'bg-gradient-to-r from-transparent via-white/45 to-red-200/35'
              : 'bg-gradient-to-l from-transparent via-white/45 to-red-200/35'
          }`}
        />
      </div>
      <span
        className="h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] bg-gradient-to-br from-red-200/90 to-orange-400/50 shadow-[0_0_8px_rgba(239,68,68,0.65)]"
        aria-hidden="true"
      />
    </div>
  );
}

function LowRiskTitle() {
  return (
    <div className="relative shrink-0 px-3 sm:px-5">
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.18),transparent_72%)] blur-md"
        aria-hidden="true"
      />
      <h2 className="relative font-display text-sm font-black uppercase leading-none tracking-[0.24em] sm:text-base">
        <span className="bg-gradient-to-b from-emerald-100 via-green-300 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(34,197,94,0.4)]">
          Low
        </span>
        <span className="mx-1.5 bg-gradient-to-b from-cyan-100 via-sky-300 to-cyan-600 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]">
          Risk
        </span>
      </h2>
    </div>
  );
}

function LowRiskOrnamentLine({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';

  return (
    <div
      className={`flex w-full min-w-0 items-center gap-1.5 sm:gap-2 ${
        isLeft ? '' : 'flex-row-reverse'
      }`}
    >
      <LineCap flip={!isLeft} />
      <div className="relative h-3 min-w-0 flex-1">
        <div
          className={`absolute top-1/2 h-[2px] w-full -translate-y-1/2 ${
            isLeft
              ? 'bg-gradient-to-r from-emerald-500/10 via-green-400/55 to-cyan-400/75'
              : 'bg-gradient-to-l from-emerald-500/10 via-green-400/55 to-cyan-400/75'
          }`}
        />
        <div
          className={`absolute top-1/2 h-px w-full -translate-y-1/2 blur-[0.5px] ${
            isLeft
              ? 'bg-gradient-to-r from-transparent via-white/45 to-emerald-200/35'
              : 'bg-gradient-to-l from-transparent via-white/45 to-emerald-200/35'
          }`}
        />
      </div>
      <span
        className="h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] bg-gradient-to-br from-emerald-200/90 to-cyan-400/50 shadow-[0_0_8px_rgba(34,197,94,0.65)]"
        aria-hidden="true"
      />
    </div>
  );
}

function BattlesTitle() {
  return (
    <div className="relative shrink-0 px-3 sm:px-5">
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.2),transparent_72%)] blur-md"
        aria-hidden="true"
      />
      <h2 className="relative font-display text-sm font-black uppercase leading-none tracking-[0.24em] sm:text-base">
        <span className="bg-gradient-to-b from-violet-100 via-purple-300 to-violet-600 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(139,92,246,0.45)]">
          Battles
        </span>
      </h2>
    </div>
  );
}

function BattlesOrnamentLine({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';

  return (
    <div
      className={`flex w-full min-w-0 items-center gap-1.5 sm:gap-2 ${
        isLeft ? '' : 'flex-row-reverse'
      }`}
    >
      <LineCap flip={!isLeft} />
      <div className="relative h-3 min-w-0 flex-1">
        <div
          className={`absolute top-1/2 h-[2px] w-full -translate-y-1/2 ${
            isLeft
              ? 'bg-gradient-to-r from-violet-500/10 via-purple-400/55 to-fuchsia-400/75'
              : 'bg-gradient-to-l from-violet-500/10 via-purple-400/55 to-fuchsia-400/75'
          }`}
        />
        <div
          className={`absolute top-1/2 h-px w-full -translate-y-1/2 blur-[0.5px] ${
            isLeft
              ? 'bg-gradient-to-r from-transparent via-white/45 to-violet-200/35'
              : 'bg-gradient-to-l from-transparent via-white/45 to-violet-200/35'
          }`}
        />
      </div>
      <span
        className="h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] bg-gradient-to-br from-violet-200/90 to-fuchsia-400/50 shadow-[0_0_8px_rgba(139,92,246,0.65)]"
        aria-hidden="true"
      />
    </div>
  );
}

function MixedTitle() {
  return (
    <div className="relative shrink-0 px-3 sm:px-5">
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.18),transparent_72%)] blur-md"
        aria-hidden="true"
      />
      <h2 className="relative font-display text-sm font-black uppercase leading-none tracking-[0.24em] sm:text-base">
        <span className="bg-gradient-to-b from-amber-100 via-orange-300 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(251,191,36,0.4)]">
          Mixed
        </span>
      </h2>
    </div>
  );
}

function MixedOrnamentLine({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';

  return (
    <div
      className={`flex w-full min-w-0 items-center gap-1.5 sm:gap-2 ${
        isLeft ? '' : 'flex-row-reverse'
      }`}
    >
      <LineCap flip={!isLeft} />
      <div className="relative h-3 min-w-0 flex-1">
        <div
          className={`absolute top-1/2 h-[2px] w-full -translate-y-1/2 ${
            isLeft
              ? 'bg-gradient-to-r from-amber-500/10 via-orange-400/55 to-yellow-400/75'
              : 'bg-gradient-to-l from-amber-500/10 via-orange-400/55 to-yellow-400/75'
          }`}
        />
        <div
          className={`absolute top-1/2 h-px w-full -translate-y-1/2 blur-[0.5px] ${
            isLeft
              ? 'bg-gradient-to-r from-transparent via-white/45 to-amber-200/35'
              : 'bg-gradient-to-l from-transparent via-white/45 to-amber-200/35'
          }`}
        />
      </div>
      <span
        className="h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] bg-gradient-to-br from-amber-200/90 to-orange-400/50 shadow-[0_0_8px_rgba(251,191,36,0.65)]"
        aria-hidden="true"
      />
    </div>
  );
}

function SectionHeader({
  title,
  variant,
  open,
  onToggle,
}: {
  title?: string;
  variant: 'default' | 'fifty-fifty' | 'high-risk' | 'low-risk' | 'battles' | 'mixed';
  open: boolean;
  onToggle: () => void;
}) {
  if (variant === 'mixed') {
    return (
      <div className="relative mb-3 w-full sm:mb-4">
        <div className="flex w-full items-center">
          <div className="flex min-w-0 flex-1 items-center justify-end pr-3 sm:pr-4">
            <MixedOrnamentLine side="left" />
          </div>
          <MixedTitle />
          <div className="flex min-w-0 flex-1 items-center justify-start pl-3 sm:pl-4">
            <MixedOrnamentLine side="right" />
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-[#12101c]/85 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 backdrop-blur-sm transition hover:text-white/70 sm:text-[11px]"
          aria-expanded={open}
        >
          {open ? 'Hide' : 'Show'}
          <svg
            viewBox="0 0 16 16"
            className={`h-3 w-3 transition ${open ? 'rotate-0' : 'rotate-180'}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.47 10.47a.75.75 0 0 0 1.06 1.06L8 9.06l2.47 2.47a.75.75 0 1 0 1.06-1.06l-3-3a.75.75 0 0 0-1.06 0l-3 3z" />
          </svg>
        </button>
      </div>
    );
  }

  if (variant === 'battles') {
    return (
      <div className="relative mb-3 w-full sm:mb-4">
        <div className="flex w-full items-center">
          <div className="flex min-w-0 flex-1 items-center justify-end pr-3 sm:pr-4">
            <BattlesOrnamentLine side="left" />
          </div>
          <BattlesTitle />
          <div className="flex min-w-0 flex-1 items-center justify-start pl-3 sm:pl-4">
            <BattlesOrnamentLine side="right" />
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-[#12101c]/85 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 backdrop-blur-sm transition hover:text-white/70 sm:text-[11px]"
          aria-expanded={open}
        >
          {open ? 'Hide' : 'Show'}
          <svg
            viewBox="0 0 16 16"
            className={`h-3 w-3 transition ${open ? 'rotate-0' : 'rotate-180'}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.47 10.47a.75.75 0 0 0 1.06 1.06L8 9.06l2.47 2.47a.75.75 0 1 0 1.06-1.06l-3-3a.75.75 0 0 0-1.06 0l-3 3z" />
          </svg>
        </button>
      </div>
    );
  }

  if (variant === 'low-risk') {
    return (
      <div className="relative mb-5 w-full sm:mb-6">
        <div className="flex w-full items-center">
          <div className="flex min-w-0 flex-1 items-center justify-end pr-3 sm:pr-4">
            <LowRiskOrnamentLine side="left" />
          </div>
          <LowRiskTitle />
          <div className="flex min-w-0 flex-1 items-center justify-start pl-3 sm:pl-4">
            <LowRiskOrnamentLine side="right" />
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-[#12101c]/85 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 backdrop-blur-sm transition hover:text-white/70 sm:text-[11px]"
          aria-expanded={open}
        >
          {open ? 'Hide' : 'Show'}
          <svg
            viewBox="0 0 16 16"
            className={`h-3 w-3 transition ${open ? 'rotate-0' : 'rotate-180'}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.47 10.47a.75.75 0 0 0 1.06 1.06L8 9.06l2.47 2.47a.75.75 0 1 0 1.06-1.06l-3-3a.75.75 0 0 0-1.06 0l-3 3z" />
          </svg>
        </button>
      </div>
    );
  }

  if (variant === 'high-risk') {
    return (
      <div className="relative mb-5 w-full sm:mb-6">
        <div className="flex w-full items-center">
          <div className="flex min-w-0 flex-1 items-center justify-end pr-3 sm:pr-4">
            <HighRiskOrnamentLine side="left" />
          </div>
          <HighRiskTitle />
          <div className="flex min-w-0 flex-1 items-center justify-start pl-3 sm:pl-4">
            <HighRiskOrnamentLine side="right" />
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-[#12101c]/85 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 backdrop-blur-sm transition hover:text-white/70 sm:text-[11px]"
          aria-expanded={open}
        >
          {open ? 'Hide' : 'Show'}
          <svg
            viewBox="0 0 16 16"
            className={`h-3 w-3 transition ${open ? 'rotate-0' : 'rotate-180'}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.47 10.47a.75.75 0 0 0 1.06 1.06L8 9.06l2.47 2.47a.75.75 0 1 0 1.06-1.06l-3-3a.75.75 0 0 0-1.06 0l-3 3z" />
          </svg>
        </button>
      </div>
    );
  }

  if (variant === 'fifty-fifty') {
    return (
      <div className="relative mb-5 w-full sm:mb-6">
        <div className="flex w-full items-center">
          <div className="flex min-w-0 flex-1 items-center justify-end pr-3 sm:pr-4">
            <HalfOrnamentLine side="left" />
          </div>
          <FiftyFiftyTitle />
          <div className="flex min-w-0 flex-1 items-center justify-start pl-3 sm:pl-4">
            <HalfOrnamentLine side="right" />
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-[#12101c]/85 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 backdrop-blur-sm transition hover:text-white/70 sm:text-[11px]"
          aria-expanded={open}
        >
          {open ? 'Hide' : 'Show'}
          <svg
            viewBox="0 0 16 16"
            className={`h-3 w-3 transition ${open ? 'rotate-0' : 'rotate-180'}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.47 10.47a.75.75 0 0 0 1.06 1.06L8 9.06l2.47 2.47a.75.75 0 1 0 1.06-1.06l-3-3a.75.75 0 0 0-1.06 0l-3 3z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
      <div className="h-px min-w-0 flex-1 bg-white/10" aria-hidden="true" />
      <h2 className="shrink-0 font-display text-[11px] font-black uppercase tracking-[0.22em] text-white/85 sm:text-xs">
        {title}
      </h2>
      <div className="h-px min-w-0 flex-1 bg-white/10" aria-hidden="true" />
      <button
        type="button"
        onClick={onToggle}
        className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 transition hover:text-white/70 sm:text-[11px]"
        aria-expanded={open}
      >
        {open ? 'Hide' : 'Show'}
        <svg
          viewBox="0 0 16 16"
          className={`h-3 w-3 transition ${open ? 'rotate-0' : 'rotate-180'}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4.47 10.47a.75.75 0 0 0 1.06 1.06L8 9.06l2.47 2.47a.75.75 0 1 0 1.06-1.06l-3-3a.75.75 0 0 0-1.06 0l-3 3z" />
        </svg>
      </button>
    </div>
  );
}

export function CaseCatalogSection({
  title,
  variant = 'default',
  sectionId,
  children,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  return (
    <section
      id={sectionId}
      className="mx-auto w-full max-w-[1520px] scroll-mt-24 px-2 sm:px-3 lg:px-4"
    >
      <SectionHeader
        title={title}
        variant={variant}
        open={open}
        onToggle={() => setOpen(!open)}
      />

      {open ? children : null}
    </section>
  );
}
