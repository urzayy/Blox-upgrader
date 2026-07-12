function AdminChatsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M8 10h8M8 14h5M12 3c-4.97 0-9 3.58-9 8 0 1.57.52 3.03 1.42 4.24L3 21l5.05-1.62A8.94 8.94 0 0 0 12 19c4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
        fill="#22D3EE"
        stroke="#67E8F9"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Props {
  compact?: boolean;
  active?: boolean;
  attentionCount?: number;
  onOpen: () => void;
}

export function AdminChatsNavButton({
  compact = false,
  active = false,
  attentionCount = 0,
  onOpen,
}: Props) {
  return (
    <button
      type="button"
      title="Live chat inbox — deposits and withdrawals"
      aria-label="Open admin live chats inbox"
      onClick={onOpen}
      className={`group relative flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 transition sm:px-3 ${
        active
          ? 'bg-cyan-500/[0.12] shadow-[0_0_22px_rgba(34,211,238,0.28)]'
          : 'hover:bg-white/[0.03]'
      }`}
    >
      {active && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.22),transparent_72%)]"
        />
      )}
      <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center sm:h-7 sm:w-7">
        <AdminChatsIcon />
      </span>
      <span
        className={`relative z-10 whitespace-nowrap font-display font-bold uppercase tracking-wide transition ${
          compact ? 'text-[10px]' : 'text-[11px] sm:text-xs'
        } ${
          active
            ? 'text-cyan-200'
            : 'text-white/40 group-hover:text-white/65'
        }`}
      >
        Chats
      </span>
      {attentionCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 z-20 flex h-4 min-w-4 items-center justify-center rounded-full border border-deep bg-gold px-1 text-[9px] font-black leading-none text-deep shadow-[0_0_8px_rgba(176,108,255,0.45)]">
          {attentionCount > 9 ? '9+' : attentionCount}
        </span>
      )}
    </button>
  );
}
