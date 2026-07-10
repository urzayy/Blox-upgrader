import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_SKINS_CATALOG, RARITY, type Skin } from '../../data/skins';
import { CoinPrice } from '../ui/CoinPrice';
import { createInventoryGrant, isValidGrantEmail, normalizeGrantEmail } from '../../lib/inventoryGrants';
import { SkinImage } from '../skins/SkinImage';

const MAX_GIFT_QUANTITY = 99;

interface Props {
  open: boolean;
  adminEmail: string;
  onClose: () => void;
  onGiftSent?: (targetEmail: string, skin: Skin, quantity: number) => void;
}

export function AdminGiftPanel({ open, adminEmail, onClose, onGiftSent }: Props) {
  const [targetEmail, setTargetEmail] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const sendInFlightRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedSkin(null);
      setQuantity('1');
      setStatus(null);
      setSending(false);
      sendInFlightRef.current = false;
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_SKINS_CATALOG;
    return ALL_SKINS_CATALOG.filter(s =>
      s.name.toLowerCase().includes(q)
      || s.weapon.toLowerCase().includes(q),
    );
  }, [search]);

  const parsedQuantity = Number(quantity.replace(',', '.'));
  const validQuantity = Number.isFinite(parsedQuantity)
    && parsedQuantity >= 1
    && parsedQuantity <= MAX_GIFT_QUANTITY
    && Number.isInteger(parsedQuantity);

  const handleSendGift = async () => {
    if (!selectedSkin || sending || sendInFlightRef.current) return;

    const email = normalizeGrantEmail(targetEmail);
    if (!isValidGrantEmail(email)) {
      setStatus({ type: 'err', text: 'Introduce un correo electrónico válido.' });
      return;
    }
    if (!validQuantity) {
      setStatus({ type: 'err', text: `Introduce una cantidad entre 1 y ${MAX_GIFT_QUANTITY}.` });
      return;
    }

    sendInFlightRef.current = true;
    setSending(true);
    setStatus(null);
    try {
      await createInventoryGrant(email, adminEmail, selectedSkin, parsedQuantity);
      setStatus({
        type: 'ok',
        text: `${parsedQuantity}× ${selectedSkin.name} enviado${parsedQuantity === 1 ? '' : 's'} a ${email}.`,
      });
      onGiftSent?.(email, selectedSkin, parsedQuantity);
      setSelectedSkin(null);
      setQuantity('1');
    } catch {
      setStatus({ type: 'err', text: 'No se pudo enviar el regalo. ¿Está el servidor activo?' });
    } finally {
      sendInFlightRef.current = false;
      setSending(false);
    }
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
            aria-labelledby="admin-gift-title"
            className="relative flex h-[min(88vh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gold/25 bg-[#0c0a14] shadow-[0_24px_80px_rgba(0,0,0,0.75),0_0_40px_rgba(176,108,255,0.08)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gold/15 px-4 py-3">
              <div>
                <h2 id="admin-gift-title" className="font-display text-base font-bold uppercase tracking-wide text-gold">
                  Gift Items
                </h2>
                <p className="text-[11px] text-white/45">
                  Elige una skin, indica la cantidad y confirma el envío
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

            <div className="shrink-0 space-y-2 border-b border-white/5 px-4 py-3">
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-white/45">
                Correo del usuario
              </label>
              <input
                type="email"
                value={targetEmail}
                onChange={e => setTargetEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="input-filter w-full text-sm"
                autoFocus
              />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar skin por nombre o arma..."
                className="input-filter w-full text-sm"
              />
              {status && (
                <p className={`rounded-lg px-3 py-2 text-[11px] ${
                  status.type === 'ok'
                    ? 'border border-win/25 bg-win/10 text-win'
                    : 'border border-risk/25 bg-risk/10 text-risk'
                }`}
                >
                  {status.text}
                </p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
              {filtered.length === 0 ? (
                <p className="py-16 text-center text-sm text-white/40">No hay skins con ese filtro.</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] content-start items-start gap-2 sm:grid-cols-[repeat(auto-fill,minmax(108px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(118px,1fr))]">
                  {filtered.map(skin => (
                    <GiftSkinTile
                      key={skin.id}
                      skin={skin}
                      selected={selectedSkin?.id === skin.id}
                      disabled={sending}
                      onSelect={() => {
                        setSelectedSkin(skin);
                        setStatus(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-gold/15 bg-gold/5 px-4 py-3">
              {selectedSkin ? (
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                      Skin seleccionada
                    </p>
                    <p className="truncate font-display text-sm font-bold text-gold">{selectedSkin.name}</p>
                    <CoinPrice
                      value={selectedSkin.price}
                      iconClassName="h-3 w-3"
                      textClassName="font-display text-[11px] font-bold text-gold"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex flex-wrap items-end gap-2">
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-white/45">
                        Cantidad
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={MAX_GIFT_QUANTITY}
                        step={1}
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        disabled={sending}
                        className="input-filter w-24 text-sm disabled:opacity-40"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={sending || !validQuantity}
                      onClick={() => { void handleSendGift(); }}
                      className="rounded-lg border border-gold/45 bg-gold/15 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-wide text-gold transition hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      {sending ? 'Enviando…' : `Enviar ${validQuantity ? parsedQuantity : ''}`}
                    </button>
                    <button
                      type="button"
                      disabled={sending}
                      onClick={() => {
                        setSelectedSkin(null);
                        setQuantity('1');
                      }}
                      className="rounded-lg border border-white/10 px-3 py-2 text-[11px] text-white/50 transition hover:border-white/25 hover:text-white disabled:opacity-40"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-[10px] text-gold/70">
                  Pulsa una skin para elegir cantidad y enviar el regalo
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GiftSkinTile({
  skin,
  selected,
  disabled,
  onSelect,
}: {
  skin: Skin;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const r = RARITY[skin.rarity];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      title={`Seleccionar ${skin.name}`}
      className={`group relative w-full self-start overflow-hidden rounded-lg border bg-[#141820] text-left transition disabled:opacity-40 ${
        selected
          ? 'border-gold/60 ring-1 ring-gold/50 shadow-[0_0_18px_rgba(176,108,255,0.2)]'
          : 'border-white/10 hover:border-gold/50 hover:shadow-[0_0_16px_rgba(176,108,255,0.15)]'
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

      {selected && (
        <div className="absolute left-1 top-1 z-20 rounded bg-gold px-1.5 py-0.5 text-[8px] font-black uppercase text-deep">
          ✓
        </div>
      )}

      <div className="relative aspect-square w-full p-1">
        <SkinImage src={skin.image} alt={skin.name} zoom={1.22} />
      </div>

      <div className="border-t border-white/5 bg-black/40 px-1.5 py-1.5">
        <p className="line-clamp-2 min-h-[2rem] text-[9px] font-semibold leading-tight text-white/90">
          {skin.name}
        </p>
        <p className="mt-0.5 truncate text-[8px] capitalize text-gold/70">
          {selected ? 'Seleccionada' : 'Elegir →'}
        </p>
      </div>
    </button>
  );
}
