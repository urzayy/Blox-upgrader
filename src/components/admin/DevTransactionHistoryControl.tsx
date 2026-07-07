import { useState } from 'react';
import { DevTransactionHistoryPanel } from './DevTransactionHistoryPanel';

export function DevTransactionHistoryControl() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/75 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
      >
        HISTORIAL
      </button>

      <DevTransactionHistoryPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
