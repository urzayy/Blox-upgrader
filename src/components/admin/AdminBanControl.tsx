import { useState } from 'react';
import { AdminBanPanel } from './AdminBanPanel';

interface Props {
  adminEmail: string;
}

export function AdminBanControl({ adminEmail }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-risk/40 bg-risk/10 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-risk transition hover:border-risk/60 hover:bg-risk/20 hover:text-white"
      >
        BAN
      </button>

      <AdminBanPanel
        open={open}
        adminEmail={adminEmail}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
