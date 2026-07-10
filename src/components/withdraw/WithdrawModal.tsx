import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RARITY, type Skin } from '../../data/skins';
import { CoinPrice } from '../ui/CoinPrice';
import { inventoryTotal } from '../../lib/inventory';
import { MIN_WITHDRAW_TOTAL, validateWithdrawTotal } from '../../lib/withdraw';
import { SkinImage } from '../skins/SkinImage';
import { SkinLockOverlay } from '../skins/SkinLockOverlay';
import { sfx } from '../../lib/audio';

interface Props {
  open: boolean;
  inventory: Skin[];
  lockedSkinIds?: ReadonlySet<string>;
  initialSelectedIds?: string[];
  onClose: () => void;
  onRequestWithdraw: (skins: Skin[]) => Promise<string | null>;
}

export function WithdrawModal({
  open,
  inventory,
  lockedSkinIds,
  initialSelectedIds,
  onClose,
  onRequestWithdraw,
}: Props) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedIds(new Set());
      setError('');
      setSubmitting(false);
      return;
    }

    if (initialSelectedIds?.length) {
      const allowed = new Set(
        initialSelectedIds.filter(id => !lockedSkinIds?.has(id)),
      );
      setSelectedIds(allowed);
    }
  }, [open, initialSelectedIds, lockedSkinIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter(s =>
      s.name.toLowerCase().includes(q)
      || s.weapon.toLowerCase().includes(q),
    );
  }, [inventory, search]);

  const selectedSkins = useMemo(
    () => inventory.filter(s => selectedIds.has(s.id)),
    [inventory, selectedIds],
  );

  const selectedTotal = useMemo(() => inventoryTotal(selectedSkins), [selectedSkins]);

  const toggleSkin = (skin: Skin) => {
    if (lockedSkinIds?.has(skin.id)) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(skin.id)) next.delete(skin.id);
      else next.add(skin.id);
      return next;
    });
    sfx.select();
  };

  const canSubmit = selectedSkins.length > 0 && selectedTotal >= MIN_WITHDRAW_TOTAL;

  const handleWithdraw = async () => {
    if (!selectedSkins.length || submitting) return;
    const validation = validateWithdrawTotal(selectedTotal);
    if (!validation.ok) {
      setError(validation.error ?? 'Invalid withdrawal.');
      return;
    }
    setSubmitting(true);
    setError('');
    const ticketId = await onRequestWithdraw(selectedSkins);
    setSubmitting(false);
    if (ticketId) {
      onClose();
      return;
    }
    setError('No se pudo crear la solicitud de retiro. Inténtalo de nuevo.');
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
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-modal-title"
            className="relative flex h-[min(88vh,920px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#0c0a14] shadow-[0_24px_80px_rgba(0,0,0,0.75),0_0_60px_rgba(255,255,255,0.06)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <h2 id="withdraw-modal-title" className="font-display text-base font-bold uppercase tracking-wide text-white">
                  Withdraw
                </h2>
                <p className="text-[11px] text-white/45">
                  Selecciona las skins de tu inventario que quieres retirar. Mínimo{' '}
                  {MIN_WITHDRAW_TOTAL.toLocaleString('en-US')} monedas en total.
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

            <div className="shrink-0 border-b border-white/5 px-4 py-2.5">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar en tu inventario..."
                className="input-filter w-full text-sm"
                autoFocus
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
              {inventory.length === 0 ? (
                <p className="py-16 text-center text-sm text-white/40">
                  Tu inventario está vacío. No hay skins para retirar.
                </p>
              ) : filtered.length === 0 ? (
                <p className="py-16 text-center text-sm text-white/40">No hay skins con ese filtro.</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] content-start items-start gap-2 sm:grid-cols-[repeat(auto-fill,minmax(108px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(118px,1fr))]">
                  {filtered.map(skin => (
                    <WithdrawSkinTile
                      key={skin.id}
                      skin={skin}
                      selected={selectedIds.has(skin.id)}
                      locked={lockedSkinIds?.has(skin.id) ?? false}
                      onToggle={() => toggleSkin(skin)}
                    />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="mx-4 shrink-0 rounded-lg border border-risk/25 bg-risk/10 px-3 py-1.5 text-[10px] text-risk">
                {error}
              </p>
            )}

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-white/50">
                {selectedSkins.length > 0 ? (
                  <>
                    <span>
                      {selectedSkins.length} seleccionada{selectedSkins.length === 1 ? '' : 's'} ·
                    </span>
                    <CoinPrice
                      value={selectedTotal}
                      iconClassName="h-3 w-3"
                      textClassName="font-display text-[11px] font-bold text-gold"
                    />
                  </>
                ) : (
                  `Pulsa las skins que quieras retirar (mín. ${MIN_WITHDRAW_TOTAL} monedas)`
                )}
                {selectedSkins.length > 0 && selectedTotal < MIN_WITHDRAW_TOTAL && (
                  <span className="text-risk">
                    {' '}· Faltan {(MIN_WITHDRAW_TOTAL - selectedTotal).toLocaleString('en-US')} monedas
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={() => { void handleWithdraw(); }}
                className="group relative overflow-hidden rounded-lg border border-white/25 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(255,255,255,0.12)] backdrop-blur-xl transition enabled:hover:border-white/40 enabled:hover:shadow-[0_0_32px_rgba(255,255,255,0.22)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 opacity-90"
                />
                <span className="relative z-10">{submitting ? 'Enviando…' : 'Withdraw selected'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WithdrawSkinTile({
  skin,
  selected,
  locked,
  onToggle,
}: {
  skin: Skin;
  selected: boolean;
  locked: boolean;
  onToggle: () => void;
}) {
  const r = RARITY[skin.rarity];

  return (
    <button
      type="button"
      disabled={locked}
      onClick={onToggle}
      title={locked ? `${skin.name} — ya en retiro` : skin.name}
      className={`group relative w-full self-start overflow-hidden rounded-lg border bg-[#141820] text-left transition ${
        locked
          ? 'cursor-not-allowed border-white/10 opacity-90'
          : selected
            ? 'border-white/50 ring-1 ring-white/40 shadow-[0_0_18px_rgba(255,255,255,0.15)]'
            : 'border-white/10 hover:border-white/30'
      }`}
    >
      <div className="absolute inset-x-0 top-0 z-10 h-0.5" style={{ background: r.color }} />

      <div
        className="pointer-events-none absolute inset-0 opacity-20 transition group-hover:opacity-35"
        style={{ background: `radial-gradient(circle at 50% 30%, ${r.color}, transparent 75%)` }}
      />

      <div className="absolute right-1 top-1 z-20 max-w-[calc(100%-8px)] rounded bg-black/70 px-1 py-0.5">
        <CoinPrice value={skin.price} iconClassName="h-2.5 w-2.5" textClassName="text-[8px] font-bold text-gold font-display" />
      </div>

      {selected && !locked && (
        <div className="absolute bottom-8 right-1.5 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[8px] font-black text-deep shadow-[0_0_8px_rgba(255,255,255,0.45)]">
          ✓
        </div>
      )}

      {locked && <SkinLockOverlay compact label="En retiro" />}

      <div className="relative aspect-square w-full p-1">
        <SkinImage src={skin.image} alt={skin.name} zoom={1.22} />
      </div>

      <div className="border-t border-white/5 bg-black/40 px-1.5 py-1.5">
        <p className="line-clamp-2 min-h-[2rem] text-[9px] font-semibold leading-tight text-white/90">
          {skin.name}
        </p>
        <p className="mt-0.5 truncate text-[8px] text-white/35">{skin.wear}</p>
      </div>
    </button>
  );
}
