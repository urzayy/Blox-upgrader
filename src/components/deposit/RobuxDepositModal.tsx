import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROBUX_DEPOSIT_ICON } from '../../lib/devRobuxDeposit';
import {
  calcRobuxDepositCredit,
  MIN_ROBUX_DEPOSIT,
  ROBUX_TO_SALDO_RATE,
  validateRobuxDepositAmount,
} from '../../lib/robuxDeposit';
import {
  validateDepositBonusCode,
  type AppliedDepositBonus,
} from '../../lib/depositBonusCode';
import { CoinPrice } from '../ui/CoinPrice';
import { DepositBonusCodeField } from './DepositBonusCodeField';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (robuxAmount: number, bonus?: AppliedDepositBonus) => Promise<string | null>;
}

export function RobuxDepositModal({ open, onClose, onSubmit }: Props) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [appliedBonus, setAppliedBonus] = useState<AppliedDepositBonus | null>(null);

  const robuxAmount = useMemo(() => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) return 0;
    return value;
  }, [amount]);

  const creditTotal = useMemo(
    () => (robuxAmount > 0
      ? calcRobuxDepositCredit(robuxAmount, appliedBonus?.percent ?? 0)
      : 0),
    [appliedBonus, robuxAmount],
  );

  useEffect(() => {
    if (!open) {
      setAmount('');
      setError('');
      setLoading(false);
      setCodeInput('');
      setCodeError('');
      setAppliedBonus(null);
    }
  }, [open]);

  const handleApplyCode = async () => {
    setCodeError('');
    const result = await validateDepositBonusCode(codeInput);
    if (!result.valid) {
      setAppliedBonus(null);
      setCodeError(result.error ?? 'Invalid code.');
      return;
    }
    setAppliedBonus({
      code: codeInput.trim().toUpperCase(),
      percent: result.percent,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (robuxAmount <= 0) {
      setError('Enter a valid whole number of Robux.');
      return;
    }
    const validation = validateRobuxDepositAmount(robuxAmount);
    if (!validation.ok) {
      setError(validation.error ?? 'Invalid deposit amount.');
      return;
    }
    if (appliedBonus) {
      const recheck = await validateDepositBonusCode(appliedBonus.code);
      if (!recheck.valid) {
        setAppliedBonus(null);
        setCodeError(recheck.error ?? 'Invalid code.');
        setError('The bonus code is no longer valid.');
        return;
      }
    }
    setLoading(true);
    try {
      const ticketId = await onSubmit(robuxAmount, appliedBonus ?? undefined);
      if (!ticketId) {
        setError('Could not start the deposit chat. Please try again.');
        return;
      }
      onClose();
    } catch {
      setError('Could not start the deposit chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[125] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="robux-deposit-title"
            className="relative w-full max-w-md rounded-2xl border border-win/25 bg-[#0e1018] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-win/20 bg-black/30 p-2">
              <img src={ROBUX_DEPOSIT_ICON} alt="" className="h-full w-full object-contain" draggable={false} />
            </div>

            <h2
              id="robux-deposit-title"
              className="mt-4 text-center font-display text-lg font-bold uppercase tracking-wide text-win"
            >
              Robux deposit
            </h2>
            <p className="mt-2 text-center text-sm text-white/55">
              How many robux do you want to deposit?
            </p>
            <p className="mt-1 text-center text-[11px] font-semibold text-gold">
              1 Robux = {ROBUX_TO_SALDO_RATE} saldo · Minimum {MIN_ROBUX_DEPOSIT.toLocaleString('en-US')} Robux
            </p>

            <form onSubmit={e => { void handleSubmit(e); }} className="mt-5 space-y-3">
              <div className="flex items-center gap-2">
                <input
                type="number"
                min={MIN_ROBUX_DEPOSIT}
                step={1}
                  inputMode="numeric"
                  value={amount}
                  onChange={e => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  placeholder="Robux"
                  disabled={loading}
                  className="input-filter min-w-0 flex-1 text-center text-base"
                />
                {robuxAmount > 0 && (
                  <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/5 px-2.5 py-2">
                    <span className="text-[10px] font-bold uppercase text-white/40">=</span>
                    <CoinPrice
                      value={creditTotal}
                      iconClassName="h-3.5 w-3.5"
                      textClassName="font-display text-sm font-bold text-gold"
                    />
                  </div>
                )}
              </div>

              <DepositBonusCodeField
                code={codeInput}
                applied={Boolean(appliedBonus)}
                bonusPercent={appliedBonus?.percent ?? 0}
                error={codeError}
                onCodeChange={value => {
                  setCodeInput(value);
                  setCodeError('');
                }}
                onApply={() => { void handleApplyCode(); }}
                onClear={() => {
                  setAppliedBonus(null);
                  setCodeInput('');
                  setCodeError('');
                }}
              />

              {error && (
                <p className="rounded-lg border border-risk/25 bg-risk/10 px-3 py-2 text-center text-[11px] text-risk">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-white/10 py-2.5 text-xs text-white/60 transition hover:border-white/25 hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !amount.trim()}
                  className="flex-1 rounded-lg border border-win/40 bg-win/15 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-win transition hover:bg-win/25 disabled:cursor-wait disabled:opacity-40"
                >
                  {loading ? 'Opening…' : 'Accept'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
