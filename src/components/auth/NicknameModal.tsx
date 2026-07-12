import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NicknameModal({ open, onClose }: Props) {
  const { user, setNickname } = useAuth();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && user) {
      setValue(user.nickname ?? '');
      setError('');
    }
  }, [open, user]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const result = setNickname(value);
    if (result.ok) onClose();
    else setError(result.error ?? 'Could not save nickname.');
  };

  return (
    <AnimatePresence>
      {open && user && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="nickname-title"
            className="relative w-full max-w-sm rounded-2xl border border-gold/20 bg-panel p-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
            initial={{ scale: 0.92, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
          >
            <h2 id="nickname-title" className="font-display text-lg font-bold text-white">
              Your nickname
            </h2>
            <p className="mt-1 text-sm text-white/45">
              It will be shown instead of your email. Leave it empty to show your email again.
            </p>
            <p className="mt-1 text-[11px] text-white/30">{user.email}</p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="e.g. ShadowViper"
                maxLength={20}
                className="input-filter w-full text-sm"
                autoFocus
              />

              {error && (
                <p className="rounded-lg border border-risk/30 bg-risk/10 px-3 py-2 text-sm text-risk">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white/60 transition hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gold py-2.5 font-display text-sm font-black uppercase tracking-wide text-black"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
