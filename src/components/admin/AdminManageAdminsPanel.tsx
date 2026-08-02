import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  addAdminEmail,
  fetchAdminEmails,
  removeAdminEmail,
} from '../../lib/adminEmailsApi';
import { CREATOR_EMAIL } from '../../lib/auth';
import { isValidGrantEmail, normalizeGrantEmail } from '../../lib/inventoryGrants';

interface Props {
  open: boolean;
  creatorEmail: string;
  onClose: () => void;
  onAdminsChanged?: () => void;
}

export function AdminManageAdminsPanel({ open, creatorEmail, onClose, onAdminsChanged }: Props) {
  const [targetEmail, setTargetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [admins, setAdmins] = useState<string[]>([]);

  const loadAdmins = useCallback(async () => {
    setListLoading(true);
    try {
      const next = await fetchAdminEmails(creatorEmail);
      setAdmins(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load administrators.');
    } finally {
      setListLoading(false);
    }
  }, [creatorEmail]);

  useEffect(() => {
    if (!open) {
      setTargetEmail('');
      setLoading(false);
      setError('');
      setSuccess('');
      setAdmins([]);
      return;
    }
    void loadAdmins();
  }, [open, loadAdmins]);

  const handleAdd = async () => {
    const email = normalizeGrantEmail(targetEmail);
    if (!isValidGrantEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const next = await addAdminEmail(creatorEmail, email);
      setAdmins(next);
      setSuccess(`${email} is now an administrator.`);
      setTargetEmail('');
      onAdminsChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (email: string) => {
    setError('');
    setSuccess('');
    try {
      const next = await removeAdminEmail(creatorEmail, email);
      setAdmins(next);
      setSuccess(`${email} is no longer an administrator.`);
      onAdminsChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove administrator.');
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
            aria-label="Close"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-manage-admins-title"
            className="relative flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gold/40 bg-[#0c0a14] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gold/20 bg-gold/10 px-4 py-3">
              <div>
                <h2 id="admin-manage-admins-title" className="font-display text-base font-bold uppercase tracking-wide text-gold">
                  Administrar admins
                </h2>
                <p className="text-[11px] text-white/45">
                  Add or remove administrator access — creator only
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

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-white/40">
                  Email to grant admin
                </label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={e => setTargetEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="input-filter w-full text-sm"
                />
              </div>

              <button
                type="button"
                disabled={loading || !targetEmail.trim()}
                onClick={() => { void handleAdd(); }}
                className="w-full rounded-lg border border-gold/50 bg-gold/20 px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-wide text-gold transition hover:border-gold hover:bg-gold/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Adding…' : 'Add administrator'}
              </button>

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

              <div className="border-t border-white/10 pt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-display text-[11px] font-bold uppercase tracking-wide text-white/70">
                    Administrators ({admins.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => { void loadAdmins(); }}
                    disabled={listLoading}
                    className="rounded border border-white/10 px-2 py-1 text-[10px] text-white/50 transition hover:border-white/25 hover:text-white disabled:opacity-40"
                  >
                    {listLoading ? '…' : 'Refresh'}
                  </button>
                </div>

                {listLoading && admins.length === 0 ? (
                  <p className="py-6 text-center text-[11px] text-white/35">Loading…</p>
                ) : admins.length === 0 ? (
                  <p className="py-6 text-center text-[11px] text-white/35">No administrators found.</p>
                ) : (
                  <ul className="space-y-2">
                    {admins.map(email => (
                      <li
                        key={email}
                        className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white/90">{email}</p>
                          <p className="text-[10px] text-white/40">
                            {email === CREATOR_EMAIL ? 'Creator · cannot be removed' : 'Administrator'}
                          </p>
                        </div>
                        {email !== CREATOR_EMAIL && (
                          <button
                            type="button"
                            onClick={() => { void handleRemove(email); }}
                            className="shrink-0 rounded border border-white/15 px-2 py-1 text-[10px] uppercase tracking-wide text-white/60 transition hover:border-risk/40 hover:text-risk"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
