import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AdminChatToast } from '../../lib/adminChatNotifications';

interface Props {
  toasts: AdminChatToast[];
  onDismiss: (toastId: string) => void;
  onOpenTicket: (ticketId: string) => void;
  durationMs?: number;
}

function toastTitle(toast: AdminChatToast): string {
  if (toast.kind === 'new_chat') {
    return toast.ticketType === 'deposit' ? 'Nuevo depósito' : 'Nuevo retiro';
  }
  return toast.ticketType === 'deposit' ? 'Mensaje · Depósito' : 'Mensaje · Retiro';
}

function toastIcon(toast: AdminChatToast): string {
  if (toast.kind === 'new_chat') {
    return toast.ticketType === 'deposit' ? '↓' : '↑';
  }
  return '💬';
}

export function AdminChatNotificationStack({
  toasts,
  onDismiss,
  onOpenTicket,
  durationMs = 7000,
}: Props) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!toasts.length) return;
    const latest = toasts[toasts.length - 1];
    const id = window.setTimeout(() => dismissRef.current(latest.id), durationMs);
    return () => window.clearTimeout(id);
  }, [toasts, durationMs]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map(toast => (
          <motion.button
            key={toast.id}
            type="button"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onClick={() => {
              onOpenTicket(toast.ticketId);
              onDismiss(toast.id);
            }}
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl ${
              toast.ticketType === 'deposit'
                ? 'border-gold/45 bg-[#0c0e14]/95 shadow-[0_0_28px_rgba(255,215,0,0.12)]'
                : 'border-win/45 bg-[#0c0e14]/95 shadow-[0_0_28px_rgba(0,230,118,0.12)]'
            }`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-base font-black ${
              toast.ticketType === 'deposit'
                ? 'border-gold/40 bg-gold/15 text-gold'
                : 'border-win/40 bg-win/15 text-win'
            }`}
            >
              {toastIcon(toast)}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-display text-sm font-bold uppercase tracking-wide ${
                toast.ticketType === 'deposit' ? 'text-gold' : 'text-win'
              }`}
              >
                {toastTitle(toast)}
              </p>
              <p className="truncate text-[12px] font-semibold text-white">{toast.userLabel}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-white/50">{toast.preview}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/30">
                Toca para abrir chat
              </p>
            </div>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={event => {
                event.stopPropagation();
                onDismiss(toast.id);
              }}
              className="shrink-0 rounded-md px-1.5 py-0.5 text-sm text-white/35 transition hover:bg-white/10 hover:text-white/70"
            >
              ×
            </button>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
