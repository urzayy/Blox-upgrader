import { useState } from 'react';
import { AdminManageAdminsPanel } from './AdminManageAdminsPanel';

interface Props {
  creatorEmail: string;
  onAdminsChanged?: () => void;
}

export function AdminManageAdminsControl({ creatorEmail, onAdminsChanged }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-gold transition hover:border-gold/60 hover:bg-gold/20 hover:text-white"
      >
        Administrar admins
      </button>

      <AdminManageAdminsPanel
        open={open}
        creatorEmail={creatorEmail}
        onClose={() => setOpen(false)}
        onAdminsChanged={onAdminsChanged}
      />
    </>
  );
}
