import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CoinPrice } from '../ui/CoinPrice';
import {
  fetchUserWithdrawTickets,
  getDepositCreditAmount,
  getTicketType,
  type WithdrawTicket,
} from '../../lib/withdrawChat';

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
}

type Tab = 'deposits' | 'withdrawals';

function formatWhen(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(',', '');
}

function shortId(id: string): string {
  return id.replace(/[^a-z0-9]/gi, '').slice(0, 8) || id.slice(0, 8);
}

function depositMethod(ticket: WithdrawTicket): string {
  if ((ticket.robuxAmount ?? 0) > 0) return 'ROBUX';
  if (ticket.skins.length > 0) return 'SKINS';
  return 'DEPOSIT';
}

function withdrawMethod(): string {
  return 'WITHDRAW';
}

export function ProfilePaymentHistoryModal({ open, onClose, userId }: Props) {
  const [tab, setTab] = useState<Tab>('deposits');
  const [tickets, setTickets] = useState<WithdrawTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const pageSize = 8;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void fetchUserWithdrawTickets(userId)
      .then(all => {
        setTickets(all.filter(t => t.status === 'completed'));
        setPage(0);
      })
      .finally(() => setLoading(false));
  }, [open, userId]);

  const filtered = tickets.filter(ticket => {
    const type = getTicketType(ticket);
    return tab === 'deposits' ? type === 'deposit' : type === 'withdraw';
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close history"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative flex h-[min(78vh,680px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151820] shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
            initial={{ scale: 0.95, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-white">Payment History</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-white/10 px-2.5 py-1.5 text-sm text-white/50 transition hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-6 border-b border-white/10 px-5">
              {(['deposits', 'withdrawals'] as Tab[]).map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setTab(key); setPage(0); }}
                  className={`border-b-2 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                    tab === key
                      ? 'border-[#b56bff] text-[#b56bff]'
                      : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
                >
                  {key === 'deposits' ? 'Deposits' : 'Withdrawals'}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="sticky top-0 bg-[#151820] text-[11px] uppercase tracking-wide text-white/35">
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-3 py-3 font-semibold">Method</th>
                    <th className="px-3 py-3 font-semibold">Amount</th>
                    <th className="px-3 py-3 font-semibold">Promo code</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center text-white/40">Loading…</td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center text-white/40">
                        No completed {tab === 'deposits' ? 'deposits' : 'withdrawals'}.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map(ticket => {
                      const isDeposit = getTicketType(ticket) === 'deposit';
                      const amount = isDeposit ? getDepositCreditAmount(ticket) : ticket.total;
                      return (
                        <tr key={ticket.id} className="border-b border-white/[0.06] text-white/80">
                          <td className="px-5 py-3 font-mono text-xs text-white/45">{shortId(ticket.id)}</td>
                          <td className="px-3 py-3 text-white/70">
                            {isDeposit ? depositMethod(ticket) : withdrawMethod()}
                          </td>
                          <td className="px-3 py-3">
                            <CoinPrice
                              value={amount}
                              iconClassName="h-3.5 w-3.5"
                              textClassName="text-sm font-bold text-[#b56bff]"
                            />
                          </td>
                          <td className="px-3 py-3 text-xs uppercase text-white/45">
                            {ticket.bonusCode ?? '—'}
                          </td>
                          <td className="px-5 py-3 text-xs text-white/45">{formatWhen(ticket.updatedAt)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-3">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="rounded border border-white/10 px-2 py-1 text-white/50 disabled:opacity-30"
              >
                ‹
              </button>
              <span className="text-xs text-white/45">{page + 1} / {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                className="rounded border border-white/10 px-2 py-1 text-white/50 disabled:opacity-30"
              >
                ›
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
