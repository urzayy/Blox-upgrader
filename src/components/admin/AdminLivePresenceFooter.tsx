import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchAdminPresenceCount } from '../../lib/presenceApi';

interface Props {
  adminEmail: string;
}

type PresenceStatus = 'loading' | 'ready' | 'error';

export function AdminLivePresenceFooter({ adminEmail }: Props) {
  const [status, setStatus] = useState<PresenceStatus>('loading');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const snapshot = await fetchAdminPresenceCount(adminEmail);
      if (cancelled) return;

      if (!snapshot) {
        setStatus('error');
        return;
      }

      setCount(snapshot.count);
      setStatus('ready');
    };

    void refresh();
    const id = window.setInterval(() => { void refresh(); }, 12_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [adminEmail]);

  const label =
    status === 'loading'
      ? 'conectados reales: …'
      : status === 'error'
        ? 'conectados reales: sin datos'
        : `conectados reales: ${count?.toLocaleString('es-ES') ?? '0'}`;

  return createPortal(
    <footer className="pointer-events-none fixed inset-x-0 bottom-2 z-[250] flex justify-center px-3">
      <p
        className={`rounded-md border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide backdrop-blur-sm ${
          status === 'error'
            ? 'border-red-400/25 bg-[#1a1018]/90 text-red-300/80'
            : 'border-white/10 bg-[#080610]/88 text-white/55'
        }`}
      >
        {label}
      </p>
    </footer>,
    document.body,
  );
}
