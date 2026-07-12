interface Props {
  active: boolean;
  onClick: () => void;
  className?: string;
}

export function TurboToggleButton({ active, onClick, className = '' }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={active ? 'Turbo enabled' : 'Turbo disabled'}
      aria-pressed={active}
      aria-label={active ? 'Disable turbo' : 'Enable turbo'}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
        active
          ? 'border-[#a855f7] bg-violet-500/15 shadow-[0_0_18px_rgba(168,85,247,0.45)]'
          : 'border-white/10 bg-[#1a1530]/90 hover:border-violet-500/35'
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition ${active ? 'drop-shadow-[0_0_6px_rgba(176,108,255,0.8)]' : 'opacity-50'}`}
        aria-hidden="true"
      >
        <path
          d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
          fill={active ? '#B56BFF' : '#7C3AED'}
          stroke="#0a0a0a"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
