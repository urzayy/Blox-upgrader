import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkinCatalogCart, type CatalogCartItem } from '../shop/SkinCatalogCart';

export type DepositItem = CatalogCartItem;

interface Props {
  open: boolean;
  onClose: () => void;
  onRequestDeposit: (items: DepositItem[]) => Promise<string | null>;
}

export function DepositModal({ open, onClose, onRequestDeposit }: Props) {
  const [error, setError] = useState('');

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
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deposit-modal-title"
            className="relative flex h-[min(88vh,760px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gold/25 bg-[#0e1018] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
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
                  Selecciona las skins y cantidades que quieres depositar. Abrimos un chat en vivo con los administradores.
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
                Cerrar
              </button>
            </div>

            <SkinCatalogCart
              className="min-h-0 flex-1"
              paginated={false}
              priceSort="desc"
              submitIcon="chat"
              submitLabel="Live chat"
              emptyError="Selecciona al menos una skin para depositar."
              onSubmit={async items => {
                setError('');
                const ticketId = await onRequestDeposit(items);
                if (!ticketId) {
                  setError('No se pudo crear la solicitud de depósito. Inténtalo de nuevo.');
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
