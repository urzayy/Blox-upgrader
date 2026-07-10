import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CoinPrice } from '../ui/CoinPrice';
import {
  fetchAdminWithdrawTickets,
  formatWithdrawSummary,
  getDepositCreditAmount,
  getTicketType,
  type WithdrawTicket,
  type WithdrawTicketStatus,
} from '../../lib/withdrawChat';

interface Props {
  open: boolean;
  onClose: () => void;
}

function formatWhen(timestamp: number): string {
  return new Date(timestamp).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusLabel(status: WithdrawTicketStatus): string {
  if (status === 'completed') return 'Completado';
  if (status === 'cancelled') return 'Cancelado';
  return 'Abierto';
}

function statusClass(status: WithdrawTicketStatus): string {
  if (status === 'completed') return 'border-win/30 bg-win/10 text-win';
  if (status === 'cancelled') return 'border-white/15 bg-white/5 text-white/45';
  return 'border-gold/30 bg-gold/10 text-gold';
}

function typeLabel(ticket: WithdrawTicket): string {
  return getTicketType(ticket) === 'deposit' ? 'Depósito' : 'Retiro';
}

function typeClass(ticket: WithdrawTicket): string {
  return getTicketType(ticket) === 'deposit'
    ? 'border-gold/30 bg-gold/10 text-gold'
    : 'border-white/20 bg-white/10 text-white/80';
}

function ticketAmount(ticket: WithdrawTicket): number {
  if (getTicketType(ticket) === 'deposit') {
    return getDepositCreditAmount(ticket);
  }
  return ticket.total;
}

export function DevTransactionHistoryPanel({ open, onClose }: Props) {
  const [tickets, setTickets] = useState<WithdrawTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchAdminWithdrawTickets(false);
      const history = all.filter(ticket => {
        const type = getTicketType(ticket);
        return type === 'deposit' || type === 'withdraw';
      });
      setTickets(history);
      setError('');
    } catch {
      setTickets([]);
      setError('No se pudo cargar el historial.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadHistory();
  }, [open, loadHistory]);

  const totals = useMemo(() => {
    let deposits = 0;
    let withdraws = 0;
    for (const ticket of tickets) {
      if (getTicketType(ticket) === 'deposit') deposits += 1;
      else withdraws += 1;
    }
    return { deposits, withdraws, all: tickets.length };
  }, [tickets]);

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
            aria-label="Cerrar historial"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dev-history-title"
            className="relative flex h-[min(82vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gold/25 bg-[#0e1018] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gold/15 px-4 py-3">
              <div>
                <h2 id="dev-history-title" className="font-display text-base font-bold uppercase tracking-wide text-gold">
                  Historial
                </h2>
                <p className="text-[11px] text-white/45">
                  Todos los depósitos y retiros registrados
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { void loadHistory(); }}
                  disabled={loading}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/25 hover:text-white disabled:opacity-40"
                >
                  Actualizar
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="shrink-0 border-b border-white/5 px-4 py-2.5">
              <div className="flex flex-wrap gap-2 text-[10px] font-display uppercase tracking-wide">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white/60">
                  Total: {totals.all}
                </span>
                <span className="rounded-md border border-gold/20 bg-gold/10 px-2 py-1 text-gold">
                  Depósitos: {totals.deposits}
                </span>
                <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white/70">
                  Retiros: {totals.withdraws}
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {error && (
                <p className="mb-3 rounded-lg border border-risk/20 bg-risk/10 px-3 py-2 text-center text-[11px] text-risk">
                  {error}
                </p>
              )}

              {loading && tickets.length === 0 ? (
                <p className="py-16 text-center text-sm text-white/40">Cargando historial…</p>
              ) : tickets.length === 0 ? (
                <p className="py-16 text-center text-sm text-white/40">No hay depósitos ni retiros registrados.</p>
              ) : (
                <div className="space-y-2">
                  {tickets.map(ticket => (
                    <article
                      key={ticket.id}
                      className="rounded-xl border border-white/10 bg-[#141820] px-3 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${typeClass(ticket)}`}>
                              {typeLabel(ticket)}
                            </span>
                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusClass(ticket.status)}`}>
                              {statusLabel(ticket.status)}
                            </span>
                          </div>
                          <p className="mt-2 font-display text-xs font-bold text-white">
                            {ticket.userLabel || ticket.userEmail}
                          </p>
                          <p className="text-[10px] text-white/40">{ticket.userEmail}</p>
                        </div>
                        <div className="text-right">
                          <CoinPrice
                            value={ticketAmount(ticket)}
                            iconClassName="ml-auto h-3.5 w-3.5"
                            textClassName="font-display text-sm font-black text-gold"
                            className="justify-end"
                          />
                          <p className="mt-1 text-[10px] text-white/35">{formatWhen(ticket.createdAt)}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-white/65">
                        {formatWithdrawSummary(ticket)}
                      </p>
                      {ticket.bonusCode && (
                        <p className="mt-1 text-[10px] text-win">
                          Promocode: {ticket.bonusCode} ({ticket.bonusPercent}%)
                        </p>
                      )}
                    </article>
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
