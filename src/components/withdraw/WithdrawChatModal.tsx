import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isCreator, type Session } from '../../lib/auth';
import { CoinPrice } from '../ui/CoinPrice';
import {
  fetchWithdrawTicket,
  getDepositCreditAmount,
  getTicketType,
  isRobuxDeposit,
  sendWithdrawChatMessage,
  updateWithdrawTicketStatus,
  type ChatMessage,
  type SupportTicketType,
  type WithdrawSkinSummary,
  type WithdrawTicket,
  type WithdrawTicketBundle,
} from '../../lib/withdrawChat';
import { markAdminTicketReadFromMessages } from '../../lib/adminChatRead';
import { requestOpenSeePlayer } from '../../lib/uiActions';
import { SkinImage } from '../skins/SkinImage';

const CREATOR_CHAT_PROMPTS = [
  {
    label: 'Prompt 1',
    text: 'Hello sir, add me @jurzoling and tell me ur username after u add me',
  },
  {
    label: 'Prompt 2',
    text: 'Join me and send me trade then whenever u send me trade tell me ur user again',
  },
  {
    label: 'Prompt 3',
    text: 'here u go good luck playing!',
  },
] as const;

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
  const activeTicketIdRef = useRef<string | null>(null);

  const applyBundle = useCallback((next: WithdrawTicketBundle, forTicketId: string) => {
    if (activeTicketIdRef.current !== forTicketId) return;
    if (next.ticket.id !== forTicketId) return;
    setBundle(prev => {
      if (prev && prev.ticket.id === forTicketId && prev.ticket.updatedAt > next.ticket.updatedAt) {
        return prev;
      }
      return next;
    });
  }, []);

  const maybeNotifyCompleted = useCallback((next: WithdrawTicketBundle, forTicketId: string) => {
    if (
      !isAdmin
      && next.ticket.status === 'completed'
      && !completedRef.current
      && activeTicketIdRef.current === forTicketId
    ) {
      completedRef.current = true;
      onTicketCompleted(next.ticket);
    }
  }, [isAdmin, onTicketCompleted]);

  useEffect(() => {
    if (!open || !ticketId) {
      activeTicketIdRef.current = null;
      setBundle(null);
      setDraft('');
      setSending(false);
      setError('');
      completedRef.current = false;
      return;
    }

    activeTicketIdRef.current = ticketId;
    setBundle(null);
    setDraft('');
    setSending(false);
    setError('');
    completedRef.current = false;

    let cancelled = false;

    const load = async () => {
      const loadingTicketId = ticketId;
      try {
        const next = await fetchWithdrawTicket(loadingTicketId);
        if (cancelled || activeTicketIdRef.current !== loadingTicketId) return;
        applyBundle(next, loadingTicketId);
        setError('');
        if (isAdmin) {
          markAdminTicketReadFromMessages(loadingTicketId, next.messages);
        }
        maybeNotifyCompleted(next, loadingTicketId);
      } catch {
        if (cancelled || activeTicketIdRef.current !== loadingTicketId) return;
        setError('Could not load chat. Check your connection and try again.');
      }
    };

    void load();
    const id = setInterval(() => { void load(); }, 2500);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [open, ticketId, isAdmin, applyBundle, maybeNotifyCompleted]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [bundle?.messages.length, ticketId]);

  const handleSend = async (text = draft) => {
    const message = text.trim();
    const currentTicketId = ticketId;
    if (!currentTicketId || !message || sending) return;
    if (bundle?.ticket.id === currentTicketId && bundle.ticket.status !== 'open') return;

    setSending(true);
    setError('');
    try {
      const next = await sendWithdrawChatMessage(currentTicketId, session, isAdmin, message);
      if (activeTicketIdRef.current !== currentTicketId) return;
      applyBundle(next, currentTicketId);
      if (text === draft) setDraft('');
    } catch {
      if (activeTicketIdRef.current === currentTicketId) {
        setError('Could not send message.');
      }
    } finally {
      if (activeTicketIdRef.current === currentTicketId) {
        setSending(false);
      }
    }
  };

  const handleStatus = async (status: 'completed' | 'cancelled') => {
    const currentTicketId = ticketId;
    if (!currentTicketId || !isAdmin || sending) return;

    setSending(true);
    setError('');
    try {
      const next = await updateWithdrawTicketStatus(currentTicketId, status);
      if (activeTicketIdRef.current !== currentTicketId) return;
      applyBundle(next, currentTicketId);
      maybeNotifyCompleted(next, currentTicketId);
    } catch {
      if (activeTicketIdRef.current === currentTicketId) {
        setError('Could not update request.');
      }
    } finally {
      if (activeTicketIdRef.current === currentTicketId) {
        setSending(false);
      }
    }
  };

  const ticket = bundle?.ticket.id === ticketId ? bundle.ticket : null;
  const messages = ticket ? (bundle?.messages ?? []) : [];
  const chatClosed = ticket?.status !== 'open';
  const ticketType = ticket ? getTicketType(ticket) : 'withdraw';
  const isDeposit = ticketType === 'deposit';
  const isHelp = ticketType === 'help';
  const showCreatorPrompts = isCreator(session) && ticket?.status === 'open';

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
            aria-label="Close chat"
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
                    : 'Live chat with administrators. Follow their instructions here.'}
                </p>
                {ticket && !isHelp && isRobuxDeposit(ticket) && (
                  <p className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-white/35">
                    <span>{ticket.robuxAmount!.toLocaleString('en-US')} R$</span>
                    <span>→</span>
                    <CoinPrice
                      value={getDepositCreditAmount(ticket)}
                      iconClassName="inline h-3 w-3 align-[-2px]"
                      textClassName="inline font-display text-[10px] font-bold text-gold"
                    />
                    <span>balance</span>
                    {ticket.bonusCode && (
                      <span className="text-win">(+{ticket.bonusPercent}% {ticket.bonusCode})</span>
                    )}
                  </p>
                )}
                {ticket && !isHelp && !isRobuxDeposit(ticket) && (
                  <p className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-white/35">
                    {ticket.skins.length} skins ·{' '}
                    <CoinPrice
                      value={getDepositCreditAmount(ticket)}
                      iconClassName="inline h-3 w-3 align-[-2px]"
                      textClassName="inline font-display text-[10px] font-bold text-gold"
                    />
                    {ticket.bonusCode && (
                      <span className="font-display font-bold uppercase text-win drop-shadow-[0_0_8px_rgba(52,211,153,0.55)]">
                        · Promocode: {ticket.bonusCode} ({ticket.bonusPercent}%)
                      </span>
                    )}
                  </p>
                )}
                {ticket && isHelp && (
                  <p className="mt-1 text-[10px] text-white/35">
                    Live help chat
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
              >
                Close
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
                  depositBonus={
                    msg.senderRole === 'system' && msg.id.includes('_welcome') && ticket?.bonusCode
                      ? {
                        code: ticket.bonusCode,
                        percent: ticket.bonusPercent ?? 0,
                        creditTotal: getDepositCreditAmount(ticket),
                      }
                      : undefined
                  }
                />
              ))}
              {!messages.length && (
                <p className="py-10 text-center text-sm text-white/35">
                  {ticket ? 'No messages yet.' : 'Connecting to support...'}
                </p>
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
                    Complete {isDeposit ? 'deposit' : isHelp ? 'chat' : 'withdrawal'}
                  </button>
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => { void handleStatus('cancelled'); }}
                    className="rounded-lg border border-risk/40 bg-risk/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-risk transition hover:bg-risk/20 disabled:opacity-40"
                  >
                    {isHelp ? 'Close chat' : 'Cancel request'}
                  </button>
                </div>
              )}

              {showCreatorPrompts && ticket?.userEmail && (
                <div className="mb-2">
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => requestOpenSeePlayer(ticket.userEmail)}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/85 transition hover:bg-white/15 disabled:opacity-40"
                  >
                    See account
                  </button>
                </div>
              )}

              {showCreatorPrompts && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {CREATOR_CHAT_PROMPTS.map(prompt => (
                    <button
                      key={prompt.label}
                      type="button"
                      disabled={sending}
                      onClick={() => { void handleSend(prompt.text); }}
                      className="rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-40"
                    >
                      {prompt.label}
                    </button>
                  ))}
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
                      void handleSend(draft);
                    }
                  }}
                  disabled={chatClosed || sending}
                  placeholder={chatClosed ? 'This chat is closed' : 'Write a message...'}
                  className="input-filter min-w-0 flex-1 text-sm disabled:opacity-40"
                />
                <button
                  type="button"
                  disabled={chatClosed || sending || !draft.trim()}
                  onClick={() => { void handleSend(draft); }}
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
  depositBonus,
}: {
  message: ChatMessage;
  isOwn: boolean;
  ticketSkins?: WithdrawSkinSummary[];
  depositBonus?: { code: string; percent: number; creditTotal: number };
}) {
  if (message.senderRole === 'system') {
    return (
      <div className="mx-auto max-w-[92%] rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-[11px] leading-relaxed text-white/55 whitespace-pre-wrap">
        {message.text}
        {ticketSkins && ticketSkins.length > 0 && (
          <TicketSkinsGallery skins={ticketSkins} depositBonus={depositBonus} />
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
          {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
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

function TicketSkinsGallery({
  skins,
  depositBonus,
}: {
  skins: WithdrawSkinSummary[];
  depositBonus?: { code: string; percent: number; creditTotal: number };
}) {
  const grouped = groupTicketSkins(skins);
  const showCreditTotal = Boolean(depositBonus && grouped.length === 1);

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
                value={showCreditTotal ? depositBonus!.creditTotal : skin.price * quantity}
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
            <div className="border-t border-white/5 bg-black/40 px-1.5 py-1">
              <p className="line-clamp-2 text-[8px] font-semibold leading-tight text-white/85">
                {skin.name}
              </p>
              {depositBonus && (
                <p className="mt-1 text-center font-display text-[7px] font-black uppercase leading-tight text-win drop-shadow-[0_0_10px_rgba(52,211,153,0.65)]">
                  Promocode usado: {depositBonus.code} ({depositBonus.percent}%)
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {depositBonus && grouped.length > 1 && (
        <p className="mt-2 text-center font-display text-[10px] font-black uppercase text-win drop-shadow-[0_0_10px_rgba(52,211,153,0.65)]">
          Promocode usado: {depositBonus.code} ({depositBonus.percent}%) ·{' '}
          <CoinPrice
            value={depositBonus.creditTotal}
            iconClassName="inline h-3 w-3 align-[-2px]"
            textClassName="inline font-display text-[10px] font-bold text-win"
          />
          {' '}total credit
        </p>
      )}
    </div>
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
