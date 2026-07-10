import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAccountByEmail } from '../../lib/adminClearApi';
import { isValidGrantEmail, normalizeGrantEmail } from '../../lib/inventoryGrants';

interface Props {
  open: boolean;
  adminEmail: string;
  onClose: () => void;
  onAccountCleared?: (email: string) => void;
}

export function AdminClearPanel({ open, adminEmail, onClose, onAccountCleared }: Props) {
  const [targetEmail, setTargetEmail] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open) {
      setTargetEmail('');
      setConfirmText('');
      setLoading(false);
      setError('');
      setSuccess('');
    }
  }, [open]);

  const normalizedEmail = normalizeGrantEmail(targetEmail);
  const canSubmit = isValidGrantEmail(normalizedEmail)
    && confirmText.trim().toUpperCase() === 'CLEAR'
    && !loading;

  const handleClear = async () => {
    const email = normalizeGrantEmail(targetEmail);
    if (!isValidGrantEmail(email)) {
      setError('Introduce un correo electrónico válido.');
      return;
    }
    if (confirmText.trim().toUpperCase() !== 'CLEAR') {
      setError('Escribe CLEAR para confirmar.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await clearAccountByEmail(adminEmail, email);
      onAccountCleared?.(result.email);
      setSuccess(
        result.clearedAccount
          ? `Cuenta de ${result.email} borrada. Inventario: 0 skins. Saldo: 0 coins. Chats eliminados: ${result.chatsRemoved}.`
          : `Datos de ${result.email} reseteados. Inventario y saldo a 0. Chats eliminados: ${result.chatsRemoved}.`,
      );
      setTargetEmail('');
      setConfirmText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo borrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

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
            aria-labelledby="admin-clear-title"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-risk/40 bg-[#0c0a14] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-risk/20 bg-risk/10 px-4 py-3">
              <div>
                <h2 id="admin-clear-title" className="font-display text-base font-bold uppercase tracking-wide text-risk">
                  Clear Account
                </h2>
                <p className="text-[11px] text-white/45">
                  Borra cuenta, inventario (0 skins), saldo (0 coins), logs, grants y chats
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

            <div className="space-y-3 px-4 py-4">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-white/40">
                  Correo a resetear
                </label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={e => setTargetEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="input-filter w-full text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-white/40">
                  Escribe CLEAR para confirmar
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="CLEAR"
                  className="input-filter w-full text-sm uppercase"
                />
              </div>

              <p className="rounded-lg border border-risk/20 bg-risk/5 px-3 py-2 text-[11px] text-white/55">
                Esta acción es irreversible. No se puede usar en cuentas admin.
              </p>

              {error && (
                <p className="rounded-lg border border-risk/20 bg-risk/10 px-3 py-2 text-[11px] text-risk">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-lg border border-win/20 bg-win/10 px-3 py-2 text-[11px] text-win">
                  {success}
                </p>
              )}

              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => { void handleClear(); }}
                className="w-full rounded-lg border border-risk/50 bg-risk/20 px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-wide text-risk transition hover:border-risk hover:bg-risk/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Borrando…' : 'Borrar todo'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
