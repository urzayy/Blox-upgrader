interface Props {
  className?: string;
  size?: 'sm' | 'md';
}

const CROWN_SRC = '/images/royal-crown.png';

export function RoyalCrownBadge({ className = '', size = 'sm' }: Props) {
  const dim = size === 'md' ? 'h-7 w-7' : 'h-5 w-5';

  return (
    <span
      className={`pointer-events-none absolute right-1.5 top-1.5 z-20 inline-flex items-center justify-center ${dim} ${className}`}
      title="BloxRoyal"
      aria-label="BloxRoyal"
    >
      <img
        src={CROWN_SRC}
        alt=""
        draggable={false}
        className="h-full w-full object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
      />
    </span>
  );
}
