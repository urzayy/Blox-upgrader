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
      className="flex items-center gap-1.5 rounded-lg border border-win/30 bg-win/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-win transition hover:border-win/50 hover:bg-win/20 disabled:cursor-wait disabled:opacity-50"
    >
      <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-win" />
      {loading ? '…' : 'Ayuda'}
    </button>
  );
}
