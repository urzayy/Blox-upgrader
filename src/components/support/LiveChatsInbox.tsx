import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoinPrice } from '../ui/CoinPrice';
import {
  fetchUserWithdrawTickets,
  getTicketType,
  isRobuxDeposit,
  type SupportTicketType,
  type WithdrawTicket,
} from '../../lib/withdrawChat';

interface Props {
  open: boolean;
  userId: string;
  onClose: () => void;
  onOpenTicket: (ticketId: string) => void;
}

export function LiveChatsInbox({ open, userId, onClose, onOpenTicket }: Props) {
  const [tickets, setTickets] = useState<WithdrawTicket[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !userId) return;
    const load = async () => {
      try {
        setTickets(await fetchUserWithdrawTickets(userId));
        setError('');
      } catch {
        setError('No se pudieron cargar tus chats.');
      }
    };
    void load();
    const id = setInterval(() => { void load(); }, 3000);
    return () => clearInterval(id);
  }, [open, userId]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="live-chats-title"
            className="relative flex h-[min(80vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-win/25 bg-[#0e1018] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-win/15 px-4 py-3">
              <div>
                <h2 id="live-chats-title" className="font-display text-base font-bold uppercase tracking-wide text-win">
                  Live Chats
                </h2>
                <p className="text-[11px] text-white/45">
                  Todos tus chats de deposit y withdraw — el historial no se borra
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {error && (
                <p className="mb-3 rounded-lg border border-risk/20 bg-risk/10 px-3 py-2 text-center text-[11px] text-risk">
                  {error}
                </p>
              )}
              {tickets.length === 0 ? (
                <p className="py-16 text-center text-sm text-white/40">
                  Aún no tienes chats. Usa Deposit, Withdraw o el botón Ayuda para abrir uno.
                </p>
              ) : (
                <div className="space-y-2">
                  {tickets.map(ticket => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => {
                        onOpenTicket(ticket.id);
                        onClose();
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#141820] px-3 py-3 text-left transition hover:border-win/40 hover:bg-win/5"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <TypeBadge type={getTicketType(ticket)} />
                          <StatusBadge status={ticket.status} />
                        </div>
                        <p className="mt-1 text-[11px] text-white/70">
                          {getTicketType(ticket) === 'help'
                            ? 'Chat de ayuda en vivo'
                            : isRobuxDeposit(ticket)
                              ? `Depósito de ${ticket.robuxAmount!.toLocaleString('en-US')} Robux → ${ticket.total.toLocaleString('es-ES')} saldo`
                              : getTicketType(ticket) === 'deposit'
                                ? `${ticket.skins.length} skins para depositar`
                                : `${ticket.skins.length} skins para retirar`}
                        </p>
                        <p className="mt-0.5 text-[10px] text-white/35">
                          {new Date(ticket.createdAt).toLocaleString('es-ES')}
                        </p>
                      </div>
                      {getTicketType(ticket) !== 'help' && isRobuxDeposit(ticket) && (
                        <div className="shrink-0 text-right">
                          <span className="block font-display text-[10px] font-bold text-win">
                            {ticket.robuxAmount!.toLocaleString('en-US')} R$
                          </span>
                          <CoinPrice
                            value={ticket.total}
                            iconClassName="h-3 w-3"
                            textClassName="font-display text-xs font-bold text-gold"
                            className="mt-0.5 justify-end"
                          />
                        </div>
                      )}
                      {getTicketType(ticket) !== 'help' && !isRobuxDeposit(ticket) && (
                        <CoinPrice
                          value={ticket.total}
                          iconClassName="h-3 w-3"
                          textClassName="font-display text-xs font-bold text-gold"
                          className="shrink-0 justify-end"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TypeBadge({ type }: { type: SupportTicketType }) {
  const styles = {
    deposit: 'border-gold/30 bg-gold/10 text-gold',
    withdraw: 'border-white/20 bg-white/10 text-white/80',
    help: 'border-win/30 bg-win/10 text-win',
  } as const;
  const labels = {
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    help: 'Help',
  } as const;

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

function StatusBadge({ status }: { status: WithdrawTicket['status'] }) {
  const styles = {
    open: 'border-gold/30 bg-gold/10 text-gold',
    completed: 'border-win/30 bg-win/10 text-win',
    cancelled: 'border-risk/30 bg-risk/10 text-risk',
  } as const;
  const labels = {
    open: 'Open',
    completed: 'Completed',
    cancelled: 'Cancelled',
  } as const;

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
