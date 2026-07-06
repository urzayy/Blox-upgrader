interface Props {
  onClick: () => void;
  loading?: boolean;
  className?: string;
}

export function LiveHelpFloating({ onClick, loading, className = '' }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title="Chat en vivo con soporte"
      aria-label="Abrir chat de ayuda en vivo"
      className={`fixed z-[120] flex items-center gap-2 rounded-xl border border-win/40 bg-[#0c1210]/95 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-win shadow-[0_8px_32px_rgba(0,0,0,0.55),0_0_24px_rgba(52,211,153,0.15)] backdrop-blur-sm transition hover:border-win/60 hover:bg-win/10 disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-win" />
      </span>
      {loading ? 'Conectando…' : 'Ayuda en vivo'}
    </button>
  );
}
