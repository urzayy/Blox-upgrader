import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_SKINS_CATALOG, RARITY, type Skin } from '../../data/skins';
import { CoinPrice } from '../ui/CoinPrice';
import { formatPrice } from '../../lib/currency';
import { SkinImage } from '../skins/SkinImage';

interface Props {
  open: boolean;
  onClose: () => void;
  onGrant: (skin: Skin) => void;
}

export function AdminSkinPicker({ open, onClose, onGrant }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_SKINS_CATALOG;
    return ALL_SKINS_CATALOG.filter(s =>
      s.name.toLowerCase().includes(q)
      || s.weapon.toLowerCase().includes(q),
    );
  }, [search]);

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
            aria-labelledby="admin-picker-title"
            className="relative flex h-[min(88vh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-win/30 bg-[#0c0a14] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-win/15 px-4 py-3">
              <div>
                <h2 id="admin-picker-title" className="font-display text-base font-bold uppercase tracking-wide text-win">
                  Admin Mode
                </h2>
                <p className="text-[11px] text-white/45">
                  Pulsa una skin para añadirla a tu inventario
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden rounded-lg border border-win/20 bg-win/10 px-2.5 py-1 text-[10px] font-semibold text-win sm:inline">
                  {filtered.length} / {ALL_SKINS_CATALOG.length}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="shrink-0 border-b border-white/5 px-4 py-2.5">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre o tipo de arma..."
                className="input-filter w-full text-sm"
                autoFocus
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
              {filtered.length === 0 ? (
                <p className="py-16 text-center text-sm text-white/40">No hay skins con ese filtro.</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2 content-start items-start sm:grid-cols-[repeat(auto-fill,minmax(108px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(118px,1fr))]">
                  {filtered.map(skin => (
                    <AdminSkinTile key={skin.id} skin={skin} onGrant={onGrant} />
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-win/10 bg-win/5 px-4 py-2 text-center text-[10px] text-win/70">
              Solo administradores · acceso restringido
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AdminSkinTile({ skin, onGrant }: { skin: Skin; onGrant: (skin: Skin) => void }) {
  const r = RARITY[skin.rarity];

  return (
    <motion.button
      type="button"
      onClick={() => onGrant(skin)}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      title={`Añadir ${skin.name} · ${formatPrice(skin.price)}`}
      className="group relative w-full self-start overflow-hidden rounded-lg border border-white/10 bg-[#141820] text-left transition hover:border-win/50 hover:shadow-[0_0_16px_rgba(0,230,118,0.15)]"
    >
      <div className="absolute inset-x-0 top-0 z-10 h-0.5" style={{ background: r.color }} />

      <div
        className="pointer-events-none absolute inset-0 opacity-20 transition group-hover:opacity-35"
        style={{ background: `radial-gradient(circle at 50% 30%, ${r.color}, transparent 75%)` }}
      />

      <div className="absolute right-1 top-1 z-20 max-w-[calc(100%-8px)] rounded bg-black/70 px-1 py-0.5">
        <CoinPrice value={skin.price} iconClassName="h-2.5 w-2.5" textClassName="text-[8px] font-bold text-gold font-display" />
      </div>

      <div className="relative aspect-square w-full p-1">
        <SkinImage src={skin.image} alt={skin.name} zoom={1.22} />
      </div>

      <div className="border-t border-white/5 bg-black/40 px-1.5 py-1.5">
        <p className="line-clamp-2 min-h-[2rem] text-[9px] font-semibold leading-tight text-white/90">
          {skin.name}
        </p>
        <p className="mt-0.5 truncate text-[8px] capitalize text-white/35">{skin.weapon}</p>
      </div>
    </motion.button>
  );
}
