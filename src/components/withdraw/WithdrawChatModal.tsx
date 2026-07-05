import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session } from '../../lib/auth';
import { CoinPrice } from '../ui/CoinPrice';
import {
  fetchWithdrawTicket,
  getTicketType,
  sendWithdrawChatMessage,
  updateWithdrawTicketStatus,
  type ChatMessage,
  type WithdrawSkinSummary,
  type WithdrawTicket,
  type WithdrawTicketBundle,
} from '../../lib/withdrawChat';
import { SkinImage } from '../skins/SkinImage';

interface Props {
  open: boolean;
  ticketId: string | null;
  session: Session;
  isAdmin: boolean;
  onClose: () => void;
  onTicketCompleted: (ticket: WithdrawTicket) => void;
}

export function WithdrawChatModal({
  open,
  ticketId,
  session,
  isAdmin,
  onClose,
  onTicketCompleted,
}: Props) {
  const [bundle, setBundle] = useState<WithdrawTicketBundle | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!ticketId) return;
    try {
      const next = await fetchWithdrawTicket(ticketId);
      setBundle(next);
      setError('');
      if (
        !isAdmin
        && next.ticket.status === 'completed'
        && !completedRef.current
      ) {
        completedRef.current = true;
        onTicketCompleted(next.ticket);
      }
    } catch {
      setError('No se pudo cargar el chat. Comprueba tu conexión e inténtalo de nuevo.');
    }
  }, [ticketId, isAdmin, onTicketCompleted]);

  useEffect(() => {
    if (!open || !ticketId) {
      setBundle(null);
      setDraft('');
      setError('');
      completedRef.current = false;
      return;
    }
    completedRef.current = false;
    void refresh();
    const id = setInterval(() => { void refresh(); }, 2500);
    return () => clearInterval(id);
  }, [open, ticketId, refresh]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [bundle?.messages.length]);

  const handleSend = async () => {
    if (!ticketId || !draft.trim() || sending || bundle?.ticket.status !== 'open') return;
    setSending(true);
    try {
      const next = await sendWithdrawChatMessage(ticketId, session, isAdmin, draft);
      setBundle(next);
      setDraft('');
      setError('');
    } catch {
      setError('No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  const handleStatus = async (status: 'completed' | 'cancelled') => {
    if (!ticketId || !isAdmin || sending) return;
    setSending(true);
    try {
      const next = await updateWithdrawTicketStatus(ticketId, status);
      setBundle(next);
      setError('');
    } catch {
      setError('No se pudo actualizar la solicitud.');
    } finally {
      setSending(false);
    }
  };

  const ticket = bundle?.ticket;
  const messages = bundle?.messages ?? [];
  const chatClosed = ticket?.status !== 'open';
  const ticketType = ticket ? getTicketType(ticket) : 'withdraw';
  const isDeposit = ticketType === 'deposit';

  return (
    <AnimatePresence>
      {open && ticketId && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar chat"
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-chat-title"
            className="relative flex h-[min(88vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0c0e14] shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(255,255,255,0.05)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="withdraw-chat-title" className="font-display text-base font-bold uppercase tracking-wide text-white">
                    Live Support
                  </h2>
                  <span className="flex items-center gap-1 rounded-full border border-win/30 bg-win/10 px-2 py-0.5 text-[9px] font-bold uppercase text-win">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-win" />
                    Live
                  </span>
                  {ticket && (
                    <TypeBadge type={ticketType} />
                  )}
                  {ticket && (
                    <StatusBadge status={ticket.status} />
                  )}
                </div>
                <p className="mt-1 text-[11px] text-white/45">
                  {isAdmin
                    ? `Chat with ${ticket?.userLabel ?? 'user'} · Admins: urzay1v1 · ecruzcastillo2009`
                    : 'Chat en vivo con los administradores. Sigue sus instrucciones aquí.'}
                </p>
                {ticket && (
                  <p className="mt-1 text-[10px] text-white/35">
                    {isDeposit ? (
                      <>
                        {ticket.skins.length} skins ·{' '}
                        <CoinPrice
                          value={ticket.total}
                          iconClassName="inline h-3 w-3 align-[-2px]"
                          textClassName="inline font-display text-[10px] font-bold text-gold"
                        />
                      </>
                    ) : (
                      <>
                        {ticket.skins.length} skins ·{' '}
                        <CoinPrice
                          value={ticket.total}
                          iconClassName="inline h-3 w-3 align-[-2px]"
                          textClassName="inline font-display text-[10px] font-bold text-gold"
                        />
                      </>
                    )}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
              {messages.map(msg => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderId === session.userId}
                  ticketSkins={
                    msg.senderRole === 'system' && msg.id.includes('_welcome')
                      ? ticket?.skins
                      : undefined
                  }
                />
              ))}
              {!messages.length && (
                <p className="py-10 text-center text-sm text-white/35">Connecting to support...</p>
              )}
            </div>

            {error && (
              <p className="shrink-0 border-t border-risk/20 bg-risk/10 px-4 py-2 text-center text-[11px] text-risk">
                {error}
              </p>
            )}

            <div className="shrink-0 border-t border-white/10 bg-[#0a0c12] px-4 py-3">
              {isAdmin && ticket?.status === 'open' && (
                <div className="mb-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => { void handleStatus('completed'); }}
                    className="rounded-lg border border-win/40 bg-win/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-win transition hover:bg-win/25 disabled:opacity-40"
                  >
                    Complete {isDeposit ? 'deposit' : 'withdrawal'}
                  </button>
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => { void handleStatus('cancelled'); }}
                    className="rounded-lg border border-risk/40 bg-risk/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-risk transition hover:bg-risk/20 disabled:opacity-40"
                  >
                    Cancel request
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  disabled={chatClosed || sending}
                  placeholder={chatClosed ? 'This chat is closed' : 'Write a message...'}
                  className="input-filter min-w-0 flex-1 text-sm disabled:opacity-40"
                />
                <button
                  type="button"
                  disabled={chatClosed || sending || !draft.trim()}
                  onClick={() => { void handleSend(); }}
                  className="shrink-0 rounded-lg border border-gold/40 bg-gold/15 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-wide text-gold transition hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChatBubble({
  message,
  isOwn,
  ticketSkins,
}: {
  message: ChatMessage;
  isOwn: boolean;
  ticketSkins?: WithdrawSkinSummary[];
}) {
  if (message.senderRole === 'system') {
    return (
      <div className="mx-auto max-w-[92%] rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-[11px] leading-relaxed text-white/55 whitespace-pre-wrap">
        {message.text}
        {ticketSkins && ticketSkins.length > 0 && (
          <TicketSkinsGallery skins={ticketSkins} />
        )}
      </div>
    );
  }

  const admin = message.senderRole === 'admin';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 ${
          admin
            ? 'rounded-bl-md border border-win/25 bg-win/10'
            : isOwn
              ? 'rounded-br-md border border-gold/25 bg-gold/10'
              : 'rounded-bl-md border border-white/10 bg-white/[0.06]'
        }`}
      >
        <p className={`mb-1 text-[9px] font-bold uppercase tracking-wide ${
          admin ? 'text-win' : isOwn ? 'text-gold' : 'text-white/45'
        }`}
        >
          {message.senderLabel}
        </p>
        <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-white/90">{message.text}</p>
        <p className="mt-1 text-[9px] text-white/25">
          {new Date(message.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function groupTicketSkins(skins: WithdrawSkinSummary[]) {
  const map = new Map<string, { skin: WithdrawSkinSummary; quantity: number }>();
  for (const skin of skins) {
    const existing = map.get(skin.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      map.set(skin.id, { skin, quantity: 1 });
    }
  }
  return Array.from(map.values());
}

function TicketSkinsGallery({ skins }: { skins: WithdrawSkinSummary[] }) {
  const grouped = groupTicketSkins(skins);

  return (
    <div className="mt-3 border-t border-white/10 pt-3 text-left">
      <div className="flex flex-wrap justify-center gap-2">
        {grouped.map(({ skin, quantity }) => (
          <div
            key={skin.id}
            className="relative w-[88px] overflow-hidden rounded-lg border border-white/10 bg-[#141820]"
            title={skin.name}
          >
            <div className="absolute right-1 top-1 z-10 rounded bg-black/75 px-1 py-0.5">
              <CoinPrice
                value={skin.price * quantity}
                iconClassName="h-2 w-2"
                textClassName="text-[7px] font-bold text-gold font-display"
              />
            </div>
            {quantity > 1 && (
              <span className="absolute left-1 top-1 z-10 rounded-full bg-gold px-1.5 py-0.5 text-[7px] font-black text-deep">
                ×{quantity}
              </span>
            )}
            <div className="relative mx-auto aspect-square w-full max-h-[64px] overflow-hidden p-1">
              <SkinImage src={skin.image} alt={skin.name} zoom={1.05} />
            </div>
            <p className="line-clamp-2 border-t border-white/5 bg-black/40 px-1.5 py-1 text-[8px] font-semibold leading-tight text-white/85">
              {skin.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: 'withdraw' | 'deposit' }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
      type === 'deposit'
        ? 'border-gold/30 bg-gold/10 text-gold'
        : 'border-white/20 bg-white/10 text-white/80'
    }`}
    >
      {type === 'deposit' ? 'Deposit' : 'Withdraw'}
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
