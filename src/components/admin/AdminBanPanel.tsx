import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  banUserByEmail,
  fetchActiveBans,
  unbanUserByEmail,
  type AccountBanRecord,
} from '../../lib/adminBanApi';
import { isValidGrantEmail, normalizeGrantEmail } from '../../lib/inventoryGrants';

interface Props {
  open: boolean;
  adminEmail: string;
  onClose: () => void;
}

const BAN_DURATION_OPTIONS = [
  { label: '1 día', value: 1 },
  { label: '3 días', value: 3 },
  { label: '7 días', value: 7 },
  { label: '14 días', value: 14 },
  { label: '30 días', value: 30 },
  { label: '90 días', value: 90 },
  { label: 'Permanente', value: 0 },
] as const;

function formatBanExpiry(ban: AccountBanRecord): string {
  if (ban.permanent || ban.bannedUntil == null) return 'Permanente';
  const remaining = ban.bannedUntil - Date.now();
  if (remaining <= 0) return 'Expirado';
  const days = Math.ceil(remaining / 86_400_000);
  if (days <= 1) {
    const hours = Math.ceil(remaining / 3_600_000);
    return `${hours}h restantes`;
  }
  return `${days}d restantes`;
}

export function AdminBanPanel({ open, adminEmail, onClose }: Props) {
  const [targetEmail, setTargetEmail] = useState('');
  const [days, setDays] = useState<number>(7);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bans, setBans] = useState<AccountBanRecord[]>([]);

  const loadBans = useCallback(async () => {
    setListLoading(true);
    try {
      const next = await fetchActiveBans(adminEmail);
      setBans(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar los baneos.');
    } finally {
      setListLoading(false);
    }
  }, [adminEmail]);

  useEffect(() => {
    if (!open) {
      setTargetEmail('');
      setDays(7);
      setReason('');
      setLoading(false);
      setError('');
      setSuccess('');
      setBans([]);
      return;
    }
    void loadBans();
  }, [open, loadBans]);

  const handleBan = async () => {
    const email = normalizeGrantEmail(targetEmail);
    if (!isValidGrantEmail(email)) {
      setError('Introduce un correo electrónico válido.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const ban = await banUserByEmail(adminEmail, email, days === 0 ? null : days, reason);
      const durationLabel = ban.permanent ? 'permanentemente' : `por ${ban.days} día(s)`;
      setSuccess(`${ban.email} baneado ${durationLabel}.`);
      setTargetEmail('');
      setReason('');
      await loadBans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo banear al usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (email: string) => {
    setError('');
    setSuccess('');
    try {
      await unbanUserByEmail(adminEmail, email);
      setSuccess(`${email} desbaneado.`);
      await loadBans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo desbanear al usuario.');
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
            aria-labelledby="admin-ban-title"
            className="relative flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-risk/40 bg-[#0e1018] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-risk/20 bg-risk/10 px-4 py-3">
              <div>
                <h2 id="admin-ban-title" className="font-display text-base font-bold uppercase tracking-wide text-risk">
                  Banear usuario
                </h2>
                <p className="text-[11px] text-white/45">
                  El usuario baneado no puede iniciar sesión — verá &quot;Cuenta suspendida&quot;
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

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[10px] uppercase tracking-wide text-white/40">
                    Correo a banear
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
                    Duración
                  </label>
                  <select
                    value={days}
                    onChange={e => setDays(Number(e.target.value))}
                    className="input-filter w-full text-sm"
                  >
                    {BAN_DURATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wide text-white/40">
                    Motivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Ej. abuso, spam, etc."
                    className="input-filter w-full text-sm"
                    maxLength={200}
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={loading || !targetEmail.trim()}
                onClick={() => { void handleBan(); }}
                className="w-full rounded-lg border border-risk/50 bg-risk/20 px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-wide text-risk transition hover:border-risk hover:bg-risk/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Baneando…' : 'Banear usuario'}
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
                    Baneos activos ({bans.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => { void loadBans(); }}
                    disabled={listLoading}
                    className="rounded border border-white/10 px-2 py-1 text-[10px] text-white/50 transition hover:border-white/25 hover:text-white disabled:opacity-40"
                  >
                    {listLoading ? '…' : 'Actualizar'}
                  </button>
                </div>

                {listLoading && bans.length === 0 ? (
                  <p className="py-6 text-center text-[11px] text-white/35">Cargando…</p>
                ) : bans.length === 0 ? (
                  <p className="py-6 text-center text-[11px] text-white/35">No hay baneos activos.</p>
                ) : (
                  <ul className="space-y-2">
                    {bans.map(ban => (
                      <li
                        key={ban.email}
                        className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white/90">{ban.email}</p>
                          <p className="text-[10px] text-white/40">
                            {formatBanExpiry(ban)}
                            {ban.reason ? ` · ${ban.reason}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { void handleUnban(ban.email); }}
                          className="shrink-0 rounded border border-white/15 px-2 py-1 text-[10px] uppercase tracking-wide text-white/60 transition hover:border-win/40 hover:text-win"
                        >
                          Unban
                        </button>
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
