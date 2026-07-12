import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoinPrice } from '../ui/CoinPrice';
import {
  createBalanceGrant,
  isValidGrantEmail,
  normalizeGrantEmail,
} from '../../lib/balanceGrants';

interface Props {
  open: boolean;
  adminEmail: string;
  onClose: () => void;
  onGiftSent?: (targetEmail: string, amount: number) => void;
}

export function AdminGiftMoneyPanel({ open, adminEmail, onClose, onGiftSent }: Props) {
  const [targetEmail, setTargetEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const sendInFlightRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setTargetEmail('');
      setAmount('');
      setStatus(null);
      setSending(false);
      sendInFlightRef.current = false;
    }
  }, [open]);

  const parsedAmount = Number(amount.replace(',', '.'));
  const validAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 && Number.isInteger(parsedAmount);

  const handleSendGift = async () => {
    if (sending || sendInFlightRef.current) return;

    const email = normalizeGrantEmail(targetEmail);
    if (!isValidGrantEmail(email)) {
      setStatus({ type: 'err', text: 'Enter a valid email address.' });
      return;
    }
    if (!validAmount) {
      setStatus({ type: 'err', text: 'Enter a whole number greater than 0.' });
      return;
    }

    sendInFlightRef.current = true;
    setSending(true);
    setStatus(null);
    try {
      await createBalanceGrant(email, adminEmail, parsedAmount);
      setStatus({
        type: 'ok',
        text: `${parsedAmount.toLocaleString('en-US')} BALANCE sent to ${email}.`,
      });
      onGiftSent?.(email, parsedAmount);
      setAmount('');
    } catch {
      setStatus({ type: 'err', text: 'Could not send gift. Is the server running?' });
    } finally {
      sendInFlightRef.current = false;
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-gift-money-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gold/25 bg-[#0c0a14] shadow-[0_24px_80px_rgba(0,0,0,0.75),0_0_40px_rgba(176,108,255,0.08)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gold/15 px-4 py-3">
              <div>
                <h2 id="admin-gift-money-title" className="font-display text-base font-bold uppercase tracking-wide text-gold">
                  Gift Money
                </h2>
                <p className="text-[11px] text-white/45">
                  Gift BALANCE to user email
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 px-4 py-4">
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-white/45">
                User email
              </label>
              <input
                type="email"
                value={targetEmail}
                onChange={e => setTargetEmail(e.target.value)}
                placeholder="user@email.com"
                className="input-filter w-full text-sm"
                autoFocus
              />

              <label className="block text-[10px] font-semibold uppercase tracking-wide text-white/45">
                BALANCE amount
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="input-filter w-full text-sm"
              />

              {validAmount && (
                <div className="flex items-center gap-2 text-[11px] text-white/50">
                  <span>Total to gift:</span>
                  <CoinPrice
                    value={parsedAmount}
                    iconClassName="h-3.5 w-3.5"
                    textClassName="font-display text-sm font-bold text-gold"
                  />
                </div>
              )}

              {status && (
                <p className={`rounded-lg px-3 py-2 text-[11px] ${
                  status.type === 'ok'
                    ? 'border border-win/25 bg-win/10 text-win'
                    : 'border border-risk/25 bg-risk/10 text-risk'
                }`}
                >
                  {status.text}
                </p>
              )}
            </div>

            <div className="flex gap-2 border-t border-white/10 px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!validAmount || !targetEmail.trim() || sending}
                onClick={() => { void handleSendGift(); }}
                className="flex-1 rounded-lg border border-gold/40 bg-gold/15 px-3 py-2 font-display text-[11px] font-bold uppercase tracking-wide text-gold transition hover:bg-gold/25 disabled:opacity-35"
              >
                {sending ? 'Sending…' : 'Send BALANCE'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
