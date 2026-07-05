import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sortSkinsByPriceDesc, type Skin } from '../../data/skins';
import { inventoryTotal } from '../../lib/inventory';
import { fetchPlayerStateByEmail, type PlayerStateSnapshot } from '../../lib/playerStateApi';
import { isValidGrantEmail, normalizeGrantEmail } from '../../lib/inventoryGrants';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from '../skins/SkinImage';

interface Props {
  open: boolean;
  adminEmail: string;
  onClose: () => void;
}

export function AdminSeePanel({ open, adminEmail, onClose }: Props) {
  const [targetEmail, setTargetEmail] = useState('');
  const [state, setState] = useState<PlayerStateSnapshot | null>(null);
  const [searchedEmail, setSearchedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setTargetEmail('');
      setState(null);
      setSearchedEmail('');
      setLoading(false);
      setError('');
    }
  }, [open]);

  const sortedInventory = useMemo(
    () => sortSkinsByPriceDesc(state?.inventory ?? []),
    [state?.inventory],
  );

  const handleSearch = async () => {
    const email = normalizeGrantEmail(targetEmail);
    if (!isValidGrantEmail(email)) {
      setError('Introduce un correo electrónico válido.');
      setState(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const next = await fetchPlayerStateByEmail(adminEmail, email);
      setSearchedEmail(email);
      setState(next);
      if (!next) {
        setError('No hay inventario sincronizado para este correo.');
      }
    } catch {
      setError('No se pudo cargar el inventario.');
      setState(null);
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
            aria-labelledby="admin-see-title"
            className="relative flex h-[min(82vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#0e1018] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <h2 id="admin-see-title" className="font-display text-base font-bold uppercase tracking-wide text-white">
                  See Inventory
                </h2>
                <p className="text-[11px] text-white/45">
                  Busca el inventario de un jugador por correo
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

            <div className="shrink-0 border-b border-white/10 px-4 py-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={targetEmail}
                  onChange={e => setTargetEmail(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') void handleSearch();
                  }}
                  placeholder="correo@ejemplo.com"
                  className="input-filter min-w-0 flex-1 text-sm"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => { void handleSearch(); }}
                  className="shrink-0 rounded-lg border border-white/25 bg-white/10 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-wide text-white transition hover:border-white/40 hover:bg-white/15 disabled:opacity-40"
                >
                  {loading ? 'Buscando…' : 'Ver'}
                </button>
              </div>
              {error && (
                <p className="mt-2 rounded-lg border border-risk/20 bg-risk/10 px-3 py-2 text-[11px] text-risk">
                  {error}
                </p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {state && (
                <>
                  <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#141820] px-3 py-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-white/40">Jugador</p>
                      <p className="text-sm font-semibold text-white">{searchedEmail}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-white/40">Saldo</p>
                      <CoinPrice value={state.balance} textClassName="font-display text-sm font-bold text-gold" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-white/40">Inventario</p>
                      <CoinPrice
                        value={inventoryTotal(state.inventory)}
                        textClassName="font-display text-sm font-bold text-gold"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-white/40">Skins</p>
                      <p className="font-display text-sm font-bold text-white">{state.inventory.length}</p>
                    </div>
                    {state.updatedAt > 0 && (
                      <div className="ml-auto text-[10px] text-white/30">
                        Actualizado {new Date(state.updatedAt).toLocaleString('es-ES', { hour12: false })}
                      </div>
                    )}
                  </div>

                  {sortedInventory.length === 0 ? (
                    <p className="py-12 text-center text-sm text-white/40">Inventario vacío.</p>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(108px,1fr))]">
                      {sortedInventory.map(skin => (
                        <ReadonlySkinCard key={skin.id} skin={skin} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {!state && !error && !loading && (
                <p className="py-16 text-center text-sm text-white/40">
                  Escribe un correo y pulsa Ver.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReadonlySkinCard({ skin }: { skin: Skin }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-[#141820]">
      <div className="absolute right-1 top-1 z-10 rounded-md border border-white/10 bg-black/60 px-1 py-0.5">
        <CoinPrice value={skin.price} iconClassName="h-2.5 w-2.5" textClassName="text-[8px] font-bold text-gold font-display" />
      </div>
      <div className="absolute inset-x-0 top-1 bottom-10">
        <SkinImage src={skin.image} alt={skin.name} zoom={1.15} />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-2 pb-2 pt-8">
        <p className="truncate text-[10px] font-semibold text-white">{skin.name}</p>
        <p className="truncate text-[8px] text-white/40">{skin.wear}</p>
      </div>
    </div>
  );
}
