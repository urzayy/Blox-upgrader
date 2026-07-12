import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createAdminPromoCode,
  deleteAdminPromoCode,
  fetchAdminPromoCodes,
  type PromoCodeEntry,
} from '../../lib/promoCodeApi';

type PanelMode = 'create' | 'delete' | 'view';

interface Props {
  open: boolean;
  mode: PanelMode;
  adminEmail: string;
  onClose: () => void;
}

function formatExpiry(entry: PromoCodeEntry): string {
  if (entry.expiresAt == null) return 'Permanent';
  return new Date(entry.expiresAt).toLocaleString('en-US');
}

export function AdminPromoCodePanel({ open, mode, adminEmail, onClose }: Props) {
  const [codes, setCodes] = useState<PromoCodeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [codeInput, setCodeInput] = useState('');
  const [percentInput, setPercentInput] = useState('10');
  const [durationValue, setDurationValue] = useState('24');
  const [durationUnit, setDurationUnit] = useState<'hours' | 'days' | 'permanent'>('days');
  const [deleteCodeInput, setDeleteCodeInput] = useState('');

  const title = mode === 'create'
    ? 'Create promo code'
    : mode === 'delete'
      ? 'Delete promo code'
      : 'Active promo codes';

  const loadCodes = async () => {
    setLoading(true);
    setStatus(null);
    try {
      setCodes(await fetchAdminPromoCodes(adminEmail));
    } catch {
      setStatus({ type: 'err', text: 'Could not load promo codes.' });
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setStatus(null);
      setCodeInput('');
      setPercentInput('10');
      setDurationValue('24');
      setDurationUnit('days');
      setDeleteCodeInput('');
      setCodes([]);
      return;
    }
    if (mode === 'view' || mode === 'delete') {
      void loadCodes();
    }
  }, [open, mode, adminEmail]);

  const handleCreate = async () => {
    const percent = Number(percentInput);
    if (!codeInput.trim()) {
      setStatus({ type: 'err', text: 'Enter a code.' });
      return;
    }
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100 || !Number.isInteger(percent)) {
      setStatus({ type: 'err', text: 'Percent must be a whole number from 1 to 100.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const entry = await createAdminPromoCode({
        adminEmail,
        code: codeInput,
        percent,
        durationUnit,
        durationValue: durationUnit === 'permanent' ? undefined : Number(durationValue),
      });
      setStatus({
        type: 'ok',
        text: `Created ${entry.code} (+${entry.percent}%).`,
      });
      setCodeInput('');
    } catch (error) {
      setStatus({
        type: 'err',
        text: error instanceof Error ? error.message : 'Could not create the code.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    setLoading(true);
    setStatus(null);
    try {
      await deleteAdminPromoCode(adminEmail, code);
      setStatus({ type: 'ok', text: `Deleted ${code.toUpperCase()}.` });
      setDeleteCodeInput('');
      await loadCodes();
    } catch (error) {
      setStatus({
        type: 'err',
        text: error instanceof Error ? error.message : 'Could not delete the code.',
      });
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
            aria-label="Close"
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-promo-title"
            className="relative flex max-h-[min(88vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gold/25 bg-[#0c0a14] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gold/15 px-4 py-3">
              <div>
                <h2 id="admin-promo-title" className="font-display text-base font-bold uppercase tracking-wide text-gold">
                  {title}
                </h2>
                <p className="mt-1 text-[11px] text-white/45">
                  Deposit bonus codes for skins and Robux.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {mode === 'create' && (
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/45">Code</span>
                    <input
                      type="text"
                      value={codeInput}
                      onChange={e => setCodeInput(e.target.value.toUpperCase())}
                      placeholder="SUMMER25"
                      className="input-filter w-full uppercase"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/45">Bonus %</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      step={1}
                      value={percentInput}
                      onChange={e => setPercentInput(e.target.value)}
                      className="input-filter w-full"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/45">Duration</span>
                      <select
                        value={durationUnit}
                        onChange={e => setDurationUnit(e.target.value as 'hours' | 'days' | 'permanent')}
                        className="input-filter w-full"
                      >
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="permanent">Permanent</option>
                      </select>
                    </label>
                    {durationUnit !== 'permanent' && (
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/45">
                          {durationUnit === 'hours' ? 'Hours' : 'Days'}
                        </span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={durationValue}
                          onChange={e => setDurationValue(e.target.value)}
                          className="input-filter w-full"
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => { void handleCreate(); }}
                    className="w-full rounded-lg border border-gold/45 bg-gradient-to-r from-[#9333ea] to-[#b56bff] py-2.5 font-display text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-105 disabled:opacity-50"
                  >
                    {loading ? 'Creating…' : 'Create code'}
                  </button>
                </div>
              )}

              {mode === 'delete' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={deleteCodeInput}
                      onChange={e => setDeleteCodeInput(e.target.value.toUpperCase())}
                      placeholder="CODE TO DELETE"
                      className="input-filter min-w-0 flex-1 uppercase"
                    />
                    <button
                      type="button"
                      disabled={loading || !deleteCodeInput.trim()}
                      onClick={() => { void handleDelete(deleteCodeInput); }}
                      className="shrink-0 rounded-lg border border-risk/40 bg-risk/15 px-4 py-2 font-display text-[10px] font-bold uppercase tracking-wide text-risk transition hover:bg-risk/25 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-2">
                    {codes.map(entry => (
                      <div
                        key={entry.code}
                        className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#141820] px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="font-display text-sm font-bold text-white">{entry.code}</p>
                          <p className="text-[10px] text-white/45">+{entry.percent}% · {formatExpiry(entry)}</p>
                        </div>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => { void handleDelete(entry.code); }}
                          className="shrink-0 rounded-lg border border-risk/30 px-2.5 py-1 text-[10px] font-bold uppercase text-risk transition hover:border-risk/50"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    {!loading && codes.length === 0 && (
                      <p className="text-center text-[11px] text-white/40">No promo codes yet.</p>
                    )}
                  </div>
                </div>
              )}

              {mode === 'view' && (
                <div className="space-y-2">
                  {loading && (
                    <p className="text-center text-[11px] text-white/45">Loading…</p>
                  )}
                  {!loading && codes.map(entry => (
                    <div
                      key={entry.code}
                      className="rounded-lg border border-white/10 bg-[#141820] px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-display text-sm font-bold text-white">{entry.code}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          entry.active
                            ? 'border border-win/30 bg-win/10 text-win'
                            : 'border border-white/15 bg-white/5 text-white/45'
                        }`}
                        >
                          {entry.active ? 'Active' : 'Expired'}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-white/55">
                        +{entry.percent}% bonus · {formatExpiry(entry)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/30">
                        Created {new Date(entry.createdAt).toLocaleString('en-US')} · {entry.createdBy}
                      </p>
                    </div>
                  ))}
                  {!loading && codes.length === 0 && (
                    <p className="text-center text-[11px] text-white/40">No promo codes yet.</p>
                  )}
                </div>
              )}

              {status && (
                <p className={`mt-3 rounded-lg border px-3 py-2 text-[11px] ${
                  status.type === 'ok'
                    ? 'border-win/25 bg-win/10 text-win'
                    : 'border-risk/25 bg-risk/10 text-risk'
                }`}
                >
                  {status.text}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
