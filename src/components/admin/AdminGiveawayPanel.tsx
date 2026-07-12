import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_SKINS_CATALOG, type Skin } from '../../data/skins';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from '../skins/SkinImage';
import {
  GIVEAWAY_PERIOD_DAYS,
  GIVEAWAY_TEMPLATES,
  type GiveawayPeriod,
} from '../../lib/giveaways';
import { adminCloseGiveaway, adminOpenGiveaway } from '../../lib/giveawayApi';
import type { GiveawayRuntimeSlot } from '../../lib/giveawayApi';

interface Props {
  open: boolean;
  adminEmail: string;
  slots: Record<GiveawayPeriod, GiveawayRuntimeSlot>;
  onClose: () => void;
  onUpdated: () => void;
}

const PERIOD_LABELS: Record<GiveawayPeriod, string> = {
  monthly: 'Monthly · 30d',
  weekly: 'Weekly · 7d',
  daily: 'Daily · 1d',
};

export function AdminGiveawayPanel({ open, adminEmail, slots, onClose, onUpdated }: Props) {
  const [period, setPeriod] = useState<GiveawayPeriod>('daily');
  const [search, setSearch] = useState('');
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [depositRequirement, setDepositRequirement] = useState('0');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_SKINS_CATALOG;
    return ALL_SKINS_CATALOG.filter(s =>
      s.name.toLowerCase().includes(q) || s.weapon.toLowerCase().includes(q),
    );
  }, [search]);

  const currentSlot = slots[period];

  const handleOpen = async () => {
    if (!selectedSkin) {
      setError('Select a prize skin.');
      return;
    }
    const deposit = Number(depositRequirement);
    if (!Number.isFinite(deposit) || deposit < 0) {
      setError('Invalid minimum deposit.');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');
    const result = await adminOpenGiveaway({
      adminEmail,
      period,
      skin: selectedSkin,
      depositRequirement: Math.floor(deposit),
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not open giveaway.');
      return;
    }
    setMessage(`Giveaway ${PERIOD_LABELS[period]} open for ${GIVEAWAY_PERIOD_DAYS[period]} day(s).`);
    onUpdated();
  };

  const handleClose = async (pickWinner: boolean) => {
    setBusy(true);
    setError('');
    setMessage('');
    const result = await adminCloseGiveaway({ adminEmail, period, pickWinner });
    setBusy(false);
    if (!result.ok) {
      const errorMap: Record<string, string> = {
        no_eligible_winner: 'No participants with entries to draw a winner.',
        giveaway_not_active: 'This giveaway is not active.',
        missing_prize_skin: 'No prize skin configured.',
        grants_unavailable: 'Could not deliver prize to inventory.',
      };
      setError(errorMap[result.error ?? ''] ?? result.error ?? 'Could not close giveaway.');
      return;
    }
    if (pickWinner && result.winner) {
      const label = result.winner.nickname || result.winner.email;
      setMessage(`Giveaway ${PERIOD_LABELS[period]} closed. Winner: ${label}.`);
    } else {
      setMessage(`Giveaway ${PERIOD_LABELS[period]} closed with no winner.`);
    }
    onUpdated();
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
            aria-label="Close admin panel"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative flex h-[min(90vh,940px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-violet-500/30 bg-[#0c0a14] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-violet-500/20 px-4 py-3">
              <div>
                <h2 className="font-display text-base font-bold uppercase tracking-wide text-violet-200">
                  Admin · Giveaways
                </h2>
                <p className="text-[11px] text-white/45">
                  Open or close giveaways with prize skin, category, and minimum deposit
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

            <div className="shrink-0 border-b border-white/5 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(GIVEAWAY_TEMPLATES) as GiveawayPeriod[]).map(key => {
                  const active = period === key;
                  const slot = slots[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPeriod(key)}
                      className={`rounded-lg border px-3 py-2 text-left transition ${
                        active
                          ? 'border-violet-400/50 bg-violet-500/15'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <span className="block font-display text-[10px] font-bold uppercase tracking-wide text-white/80">
                        {PERIOD_LABELS[key]}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase ${
                        slot.status === 'active' ? 'text-emerald-400' : 'text-white/35'
                      }`}
                      >
                        {slot.status === 'active' ? 'Active' : 'Closed'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="min-h-0 border-b border-white/5 p-4 md:border-b-0 md:border-r">
                <div className="mb-3 rounded-lg border border-white/[0.06] bg-[#12101c] p-3">
                  <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                    Estado actual · {PERIOD_LABELS[period]}
                  </p>
                  {currentSlot.status === 'active' && currentSlot.skin ? (
                    <div className="mt-2 space-y-1 text-xs text-white/65">
                      <p className="font-semibold text-white">{currentSlot.skin.name}</p>
                      <p>Min. deposit: <CoinPrice value={currentSlot.depositRequirement} textClassName="text-xs font-bold text-gold" /></p>
                      <p>Participants: {currentSlot.participants}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-white/40">No active giveaway.</p>
                  )}
                </div>

                <label className="mb-3 block">
                  <span className="mb-1.5 block font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                    Required minimum deposit
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={depositRequirement}
                    onChange={e => setDepositRequirement(e.target.value)}
                    className="input-filter w-full text-sm"
                  />
                </label>

                {selectedSkin && (
                  <div className="mb-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-2.5">
                    <p className="font-display text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                      Selected prize
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white">{selectedSkin.name}</p>
                    <CoinPrice value={selectedSkin.price} textClassName="text-xs font-bold text-gold" />
                  </div>
                )}

                {error && <p className="mb-2 text-xs text-rose-400">{error}</p>}
                {message && <p className="mb-2 text-xs text-emerald-400">{message}</p>}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || !selectedSkin}
                    onClick={() => void handleOpen()}
                    className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 font-display text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:brightness-110 disabled:opacity-45"
                  >
                    Open giveaway
                  </button>
                  <button
                    type="button"
                    disabled={busy || currentSlot.status !== 'active'}
                    onClick={() => void handleClose(true)}
                    className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-4 py-2 font-display text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-45"
                  >
                    Close and pick winner
                  </button>
                  <button
                    type="button"
                    disabled={busy || currentSlot.status !== 'active'}
                    onClick={() => void handleClose(false)}
                    className="rounded-lg border border-rose-500/35 bg-rose-500/10 px-4 py-2 font-display text-[10px] font-black uppercase tracking-[0.12em] text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-45"
                  >
                    Close without winner
                  </button>
                </div>
              </div>

              <div className="flex min-h-0 flex-col">
                <div className="shrink-0 border-b border-white/5 px-4 py-2.5">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search prize skin..."
                    className="input-filter w-full text-sm"
                  />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
                    {filtered.map(skin => (
                      <button
                        key={skin.id}
                        type="button"
                        onClick={() => setSelectedSkin(skin)}
                        title={skin.name}
                        className={`overflow-hidden rounded-lg border bg-[#141820] text-left transition hover:border-violet-400/50 ${
                          selectedSkin?.id === skin.id ? 'border-violet-400 ring-1 ring-violet-400/40' : 'border-white/10'
                        }`}
                      >
                        <div className="relative aspect-square w-full p-1">
                          <SkinImage src={skin.image} alt={skin.name} zoom={1.15} />
                        </div>
                        <div className="border-t border-white/5 px-1.5 py-1">
                          <p className="line-clamp-2 text-[9px] font-semibold text-white/85">{skin.name}</p>
                          <CoinPrice value={skin.price} iconClassName="h-2.5 w-2.5" textClassName="text-[8px] font-bold text-gold" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
