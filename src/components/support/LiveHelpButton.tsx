interface Props {
  onClick: () => void;
  loading?: boolean;
}

export function LiveHelpButton({ onClick, loading }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title="Chat en vivo con soporte"
      aria-label="Abrir chat de ayuda en vivo"
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-win/40 bg-win/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-win shadow-[0_0_16px_rgba(52,211,153,0.12)] transition hover:border-win/60 hover:bg-win/20 disabled:cursor-wait disabled:opacity-50"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-win" />
      </span>
      {loading ? 'Conectando…' : 'Ayuda en vivo'}
    </button>
  );
}
