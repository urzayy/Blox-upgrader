interface Props {
  width?: number;
  height: number;
  highlight?: boolean;
  fullWidth?: boolean;
}

export function BloxRoyalCard({ width, height, highlight, fullWidth }: Props) {
  const compact = height < 110;
  const iconSize = compact ? Math.round(height * 0.52) : 88;
  const crownClass = compact ? 'relative h-6 w-8' : 'relative h-9 w-12';

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${fullWidth ? 'w-full' : ''} ${highlight ? 'z-10' : ''}`}
      style={{
        width: fullWidth ? '100%' : width,
        height,
        background: 'linear-gradient(180deg, #0c1a30 0%, #152842 45%, #0a1424 100%)',
        boxShadow: highlight
          ? 'inset 0 0 0 2px #d4a853, 0 0 36px rgba(212,168,83,0.55), 0 0 80px rgba(212,168,83,0.2)'
          : 'inset 0 0 0 1px rgba(212,168,83,0.35)',
      }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
        viewBox="0 0 148 172"
        aria-hidden="true"
      >
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i / 14) * 360;
          return (
            <line
              key={angle}
              x1="74"
              y1="86"
              x2="74"
              y2="8"
              stroke="#d4a853"
              strokeWidth="0.6"
              opacity="0.45"
              transform={`rotate(${angle} 74 86)`}
            />
          );
        })}
      </svg>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 55% at 50% 42%, rgba(212,168,83,0.22), transparent 72%)',
        }}
      />

      <div className={`relative flex h-full flex-col items-center justify-center ${compact ? 'px-1.5' : 'px-3'}`}>
        <div
          className="relative flex items-center justify-center"
          style={{ height: iconSize, width: iconSize }}
        >
          <svg viewBox="0 0 88 88" className="absolute h-full w-full" aria-hidden="true">
            <polygon
              points="44,6 80,24 80,64 44,82 8,64 8,24"
              fill="none"
              stroke="#d4a853"
              strokeWidth="2.5"
              opacity="0.95"
            />
            <polygon
              points="44,12 72,27 72,61 44,76 16,61 16,27"
              fill="none"
              stroke="#f0d48a"
              strokeWidth="1"
              opacity="0.55"
            />
          </svg>

          <svg viewBox="0 0 48 36" className={`${crownClass} drop-shadow-[0_0_12px_rgba(212,168,83,0.65)]`} aria-hidden="true">
            <path
              d="M6 28 L10 14 L16 20 L24 10 L32 20 L38 14 L42 28 Z"
              fill="#d4a853"
              stroke="#8b6914"
              strokeWidth="1"
            />
            <rect x="8" y="28" width="32" height="5" rx="1" fill="#c9982f" />
            <circle cx="16" cy="22" r="2" fill="#f0d48a" />
            <circle cx="24" cy="18" r="2.2" fill="#f0d48a" />
            <circle cx="32" cy="22" r="2" fill="#f0d48a" />
          </svg>
        </div>

        <p
          className={`font-display font-black uppercase tracking-[0.14em] ${compact ? 'mt-1 text-[9px]' : 'mt-3 text-[15px]'}`}
          style={{
            color: '#e8c56d',
            textShadow: '0 2px 8px rgba(0,0,0,0.65), 0 0 18px rgba(212,168,83,0.35)',
          }}
        >
          BloxRoyal
        </p>
      </div>
    </div>
  );
}
