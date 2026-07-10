import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MIN_DEPOSIT_TOTAL, validateDepositTotal } from '../../lib/deposit';
import {
  calcDepositCreditTotal,
  validateDepositBonusCode,
  type AppliedDepositBonus,
} from '../../lib/depositBonusCode';
import { SkinCatalogCart, type CatalogCartItem } from '../shop/SkinCatalogCart';
import { DepositBonusCodeField } from './DepositBonusCodeField';

export type DepositItem = CatalogCartItem;

interface Props {
  open: boolean;
  onClose: () => void;
  onRequestDeposit: (items: DepositItem[], bonus?: AppliedDepositBonus) => Promise<string | null>;
}

export function DepositModal({ open, onClose, onRequestDeposit }: Props) {
  const [error, setError] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [appliedBonus, setAppliedBonus] = useState<AppliedDepositBonus | null>(null);
  const [cartTotal, setCartTotal] = useState(0);

  const checkoutTotal = useMemo(
    () => (appliedBonus
      ? calcDepositCreditTotal(cartTotal, appliedBonus.percent)
      : cartTotal),
    [appliedBonus, cartTotal],
  );

  useEffect(() => {
    if (!open) {
      setError('');
      setCodeInput('');
      setCodeError('');
      setAppliedBonus(null);
      setCartTotal(0);
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
            aria-labelledby="deposit-modal-title"
            className="relative flex h-[min(88vh,760px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gold/25 bg-[#0c0a14] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gold/15 px-4 py-3">
              <div>
                <h2 id="deposit-modal-title" className="font-display text-base font-bold uppercase tracking-wide text-gold">
                  Deposit
                </h2>
                <p className="mt-1 text-[11px] text-white/45">
                  Select the skins and quantities you want to deposit. Minimum{' '}
                  {MIN_DEPOSIT_TOTAL.toLocaleString('en-US')} coins total (many 1-coin skins are fine).
                </p>
                {error && (
                  <p className="mt-2 rounded-lg border border-risk/25 bg-risk/10 px-3 py-1.5 text-[10px] text-risk">
                    {error}
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

            <SkinCatalogCart
              className="min-h-0 flex-1"
              paginated={false}
              priceSort="desc"
              maxItemQuantity={999}
              minSubmitTotal={MIN_DEPOSIT_TOTAL}
              checkoutTotal={checkoutTotal}
              submitIcon="chat"
              submitLabel="Live chat"
              emptyError="Select at least one skin to deposit."
              footerLeft={(
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
              )}
              onCartTotalChange={setCartTotal}
              validateSubmit={(_, total) => validateDepositTotal(total)}
              onSubmit={async items => {
                setError('');
                const total = items.reduce((sum, item) => sum + item.skin.price * item.quantity, 0);
                const validation = validateDepositTotal(total);
                if (!validation.ok) {
                  setError(validation.error ?? 'Invalid deposit.');
                  return false;
                }
                if (appliedBonus) {
                  const recheck = await validateDepositBonusCode(appliedBonus.code);
                  if (!recheck.valid) {
                    setAppliedBonus(null);
                    setCodeError(recheck.error ?? 'Invalid code.');
                    setError('The bonus code is no longer valid.');
                    return false;
                  }
                }
                const ticketId = await onRequestDeposit(items, appliedBonus ?? undefined);
                if (!ticketId) {
                  setError('Could not create the deposit request. Please try again.');
                  return false;
                }
                onClose();
                return true;
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
