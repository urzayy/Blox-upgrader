interface Props {
  open: boolean;
  openCount: number;
  onOpen: () => void;
  visible?: boolean;
}

export function LiveChatsFloatingButton({ open, openCount, onOpen, visible = true }: Props) {
  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Open live chats"
      onClick={onOpen}
      className={`fixed bottom-5 right-4 z-[80] flex h-12 w-12 items-center justify-center rounded-full border font-display text-[10px] font-black uppercase tracking-wide shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:scale-105 active:scale-95 max-lg:bottom-[max(5.5rem,env(safe-area-inset-bottom))] sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 ${
        open
          ? 'border-win/50 bg-win/20 text-win shadow-[0_0_28px_rgba(0,230,118,0.35)]'
          : 'border-win/30 bg-[#0c0a14]/90 text-win hover:border-win/45 hover:bg-win/15 hover:shadow-[0_0_24px_rgba(0,230,118,0.25)]'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h8M8 14h5M12 3c-4.97 0-9 3.58-9 8 0 1.57.52 3.03 1.42 4.24L3 21l5.05-1.62A8.94 8.94 0 0 0 12 19c4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
        />
      </svg>
      {openCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-deep bg-gold px-1 text-[10px] font-black leading-none text-deep shadow-[0_0_8px_rgba(176,108,255,0.45)]">
          {openCount > 9 ? '9+' : openCount}
        </span>
      )}
    </button>
  );
}
