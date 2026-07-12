const HEX_CLIP = 'polygon(22% 0%, 78% 0%, 100% 50%, 78% 100%, 22% 100%, 0% 50%)';

export function BattleVsBadge({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative z-20 flex shrink-0 items-center justify-center ${
        compact
          ? 'h-10 w-[3rem] sm:h-11 sm:w-[3.25rem]'
          : 'h-14 w-[4rem] sm:h-[4.25rem] sm:w-[4.75rem] lg:h-16 lg:w-[5.25rem]'
      }`}
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-[#16101f]/95"
        style={{
          clipPath: HEX_CLIP,
          boxShadow:
            '0 0 22px rgba(139,92,246,0.42), 0 0 6px rgba(167,139,250,0.25), inset 0 0 14px rgba(139,92,246,0.1)',
        }}
      />
      <div
        className="absolute inset-[2px] border border-violet-400/30"
        style={{ clipPath: HEX_CLIP }}
      />
      <div
        className="absolute inset-[5px] border border-violet-300/15"
        style={{ clipPath: HEX_CLIP }}
      />
      <span className={`relative z-10 font-display font-black uppercase tracking-[0.22em] text-violet-300 ${
        compact ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'
      }`}>
        VS
      </span>
    </div>
  );
}
