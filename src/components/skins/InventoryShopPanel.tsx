import { useState } from 'react';
import type { Skin } from '../../data/skins';
import { SkinCard } from './SkinCard';
import { ShopPanel, type ShopPurchaseItem } from '../shop/ShopPanel';
import { KnifeTabIcon, PanelTabButton, ShopTabIcon } from '../ui/PanelTabIcons';

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
  const selectedIds = new Set(selected.map(s => s.id));
  const atMax = selected.length >= maxSelected;
  const lockedCount = lockedSkinIds?.size ?? 0;

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
        <div className="grid min-h-0 flex-1 grid-cols-3 content-start items-start gap-2 overflow-y-auto p-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {skins.length === 0 ? (
            <p className="col-span-full py-12 text-center text-sm text-white/40">
              Tu inventario está vacío. Compra skins en la tienda.
            </p>
          ) : (
            skins.map(s => (
              <SkinCard
                key={s.id}
                skin={s}
                selected={selectedIds.has(s.id)}
                locked={lockedSkinIds?.has(s.id)}
                variant="inventory"
                layoutIdPrefix={selectedIds.has(s.id) && selected.length === 1 ? 'input' : undefined}
                onSelect={onSelect}
                onSell={onSell}
                compact
              />
            ))
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
