interface Props {
  label?: string;
  compact?: boolean;
}

export function SkinLockOverlay({ label = 'Locked', compact }: Props) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-lg bg-black/60 backdrop-blur-[2px]">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-gold ${compact ? 'h-5 w-5' : 'h-7 w-7'}`}
        fill="currentColor"
      >
        <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-3 0h-4V7a2 2 0 1 1 4 0v2Z" />
      </svg>
      <span className={`mt-1 font-bold uppercase tracking-wide text-white/75 ${compact ? 'text-[7px]' : 'text-[8px]'}`}>
        {label}
      </span>
    </div>
  );
}
