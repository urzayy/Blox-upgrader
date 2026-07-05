import { useEffect, useMemo, useState } from 'react';
import type { Skin } from '../../data/skins';
import { SkinCard } from './SkinCard';
import { ShopPanel, type ShopPurchaseItem } from '../shop/ShopPanel';
import { KnifeTabIcon, PanelTabButton, ShopTabIcon } from '../ui/PanelTabIcons';

const PAGE_SIZE = 18;

type PanelView = 'inventory' | 'shop';

interface Props {
  skins: Skin[];
  selected: Skin[];
  maxSelected: number;
  lockedSkinIds?: ReadonlySet<string>;
  balance: number;
  requiresLogin: boolean;
  onLoginRequired: () => void;
  onSelect: (s: Skin) => void;
  onSell: (s: Skin) => void;
  onPurchase: (items: ShopPurchaseItem[]) => boolean;
}

export function InventoryShopPanel({
  skins,
  selected,
  maxSelected,
  lockedSkinIds,
  balance,
  requiresLogin,
  onLoginRequired,
  onSelect,
  onSell,
  onPurchase,
}: Props) {
  const [view, setView] = useState<PanelView>('inventory');
  const [page, setPage] = useState(0);
  const selectedIds = new Set(selected.map(s => s.id));
  const atMax = selected.length >= maxSelected;
  const lockedCount = lockedSkinIds?.size ?? 0;

  const totalPages = Math.max(1, Math.ceil(skins.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const visibleSkins = useMemo(
    () => skins.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [skins, safePage],
  );

  useEffect(() => {
    setPage(0);
  }, [skins]);

  useEffect(() => {
    setPage(p => Math.min(p, Math.max(0, totalPages - 1)));
  }, [skins.length, totalPages]);

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/8 bg-panel/95">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <PanelTabButton
            active={view === 'inventory'}
            label="Inventario"
            onClick={() => setView('inventory')}
          >
            <KnifeTabIcon />
          </PanelTabButton>
          <PanelTabButton
            active={view === 'shop'}
            label="Tienda"
            onClick={() => setView('shop')}
          >
            <ShopTabIcon />
          </PanelTabButton>
          {view === 'shop' && (
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
              Tienda
            </span>
          )}
        </div>

        {view === 'inventory' ? (
          <span className={`text-[10px] ${atMax ? 'text-gold/80' : 'text-white/35'}`}>
            {skins.length} skins · {selected.length}/{maxSelected} max
            {skins.length > PAGE_SIZE && (
              <span className="text-white/30"> · pág. {safePage + 1}/{totalPages}</span>
            )}
            {lockedCount > 0 && (
              <span className="text-gold/70"> · {lockedCount} locked</span>
            )}
          </span>
        ) : (
          <span className="text-[10px] text-white/35">
            SALDO:{' '}
            <span className="font-display font-bold text-gold">{balance.toLocaleString('es-ES')}</span>
          </span>
        )}
      </div>

      {view === 'inventory' ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            {skins.length === 0 ? (
              <p className="py-12 text-center text-sm text-white/40">
                Tu inventario está vacío. Compra skins en la tienda.
              </p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] content-start items-start gap-2 sm:grid-cols-[repeat(auto-fill,minmax(108px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(118px,1fr))]">
                {visibleSkins.map(s => (
                  <div key={s.id} className="min-w-0">
                    <SkinCard
                      skin={s}
                      selected={selectedIds.has(s.id)}
                      locked={lockedSkinIds?.has(s.id)}
                      variant="inventory"
                      layoutIdPrefix={
                        selectedIds.has(s.id) && selected.length === 1 ? 'input' : undefined
                      }
                      onSelect={onSelect}
                      onSell={onSell}
                      compact
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {skins.length > PAGE_SIZE && (
            <div className="flex shrink-0 items-center justify-center gap-1 border-t border-white/10 bg-[#0a0c12]/90 px-2 py-2">
              <button
                type="button"
                disabled={safePage <= 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 transition enabled:hover:border-white/25 enabled:hover:text-white disabled:opacity-30"
                aria-label="Página anterior"
              >
                ‹
              </button>
              <span className="min-w-[4rem] text-center text-[10px] text-white/40">
                {safePage + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 transition enabled:hover:border-white/25 enabled:hover:text-white disabled:opacity-30"
                aria-label="Página siguiente"
              >
                ›
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <ShopPanel
            balance={balance}
            requiresLogin={requiresLogin}
            onLoginRequired={onLoginRequired}
            onPurchase={onPurchase}
          />
        </div>
      )}
    </section>
  );
}
