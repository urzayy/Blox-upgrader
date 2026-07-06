import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoinPrice } from '../ui/CoinPrice';
import { loadAdminInbox, getTicketAttentionCount, getTicketType, type AdminInboxItem } from '../../lib/withdrawChat';

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenTicket: (ticketId: string) => void;
}

export function AdminWithdrawInbox({ open, onClose, onOpenTicket }: Props) {
  const [items, setItems] = useState<AdminInboxItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        setItems(await loadAdminInbox());
        setError('');
      } catch {
        setError('No se pudieron cargar las solicitudes de withdraw.');
      }
    };
    void load();
    const id = setInterval(() => { void load(); }, 3000);
    return () => clearInterval(id);
  }, [open]);

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
            aria-labelledby="admin-inbox-title"
            className="relative flex h-[min(80vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-win/25 bg-[#0e1018] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-win/15 px-4 py-3">
              <div>
                <h2 id="admin-inbox-title" className="font-display text-base font-bold uppercase tracking-wide text-win">
                  Live Chats Inbox
                </h2>
                <p className="text-[11px] text-white/45">
                  Chats abiertos de deposit y withdraw
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
              {items.length === 0 ? (
                <p className="py-16 text-center text-sm text-white/40">No hay chats abiertos.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => {
                    const { ticket } = item;
                    const attentionCount = getTicketAttentionCount(item);
                    return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => {
                        onOpenTicket(ticket.id);
                        onClose();
                      }}
                      className={`relative flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        attentionCount > 0
                          ? 'border-gold/35 bg-gold/[0.06] hover:border-gold/50 hover:bg-gold/10'
                          : 'border-white/10 bg-[#141820] hover:border-win/40 hover:bg-win/5'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
                            getTicketType(ticket) === 'deposit'
                              ? 'border-gold/30 bg-gold/10 text-gold'
                              : getTicketType(ticket) === 'help'
                                ? 'border-win/30 bg-win/10 text-win'
                                : 'border-white/20 bg-white/10 text-white/80'
                          }`}
                          >
                            {getTicketType(ticket) === 'deposit'
                              ? 'Deposit'
                              : getTicketType(ticket) === 'help'
                                ? 'Help'
                                : 'Withdraw'}
                          </span>
                          {attentionCount > 0 && (
                            <span className="rounded-full border border-gold/40 bg-gold px-2 py-0.5 text-[9px] font-black text-deep">
                              {attentionCount} nuevo{attentionCount === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-sm font-semibold text-white">{ticket.userLabel}</p>
                        <p className="truncate text-[10px] text-white/40">{ticket.userEmail}</p>
                        <p className="mt-1 text-[10px] text-white/55">
                          {getTicketType(ticket) === 'help'
                            ? 'Live help chat'
                            : `${ticket.skins.length} skins · ${ticket.skins.map(s => s.name).slice(0, 2).join(', ')}${ticket.skins.length > 2 ? '…' : ''}`}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {attentionCount > 0 && (
                          <span className="mb-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-black text-deep">
                            {attentionCount > 9 ? '9+' : attentionCount}
                          </span>
                        )}
                        {getTicketType(ticket) !== 'help' && (
                          <CoinPrice
                            value={ticket.total}
                            iconClassName="h-3 w-3 justify-end"
                            textClassName="font-display text-xs font-bold text-gold"
                            className="justify-end"
                          />
                        )}
                        <p className="mt-1 text-[9px] text-white/30">
                          {new Date(ticket.updatedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
