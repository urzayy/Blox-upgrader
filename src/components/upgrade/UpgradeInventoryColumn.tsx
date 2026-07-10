import { useMemo, useState } from 'react';
import { navigateApp } from '../../lib/appRoute';
import type { Skin } from '../../data/skins';
import { SkinCard } from '../skins/SkinCard';
import { ShopPanel, type ShopPurchaseItem } from '../shop/ShopPanel';
import { KnifeTabIcon, PanelTabButton, ShopTabIcon } from '../ui/PanelTabIcons';
import { CoinPrice } from '../ui/CoinPrice';

interface Props {
  skins: Skin[];
  selected: Skin[];
  balance: number;
  requiresLogin: boolean;
  lockedSkinIds?: ReadonlySet<string>;
  upgradeRollingIds?: ReadonlySet<string>;
  onLoginRequired: () => void;
  onSelect: (skin: Skin) => void;
  onSell: (skin: Skin) => void;
  onPurchase: (items: ShopPurchaseItem[]) => boolean;
}

type PanelView = 'inventory' | 'shop';
type SortDir = 'desc' | 'asc';

export function UpgradeInventoryColumn({
  skins,
  selected,
  balance,
  requiresLogin,
  lockedSkinIds,
  upgradeRollingIds,
  onLoginRequired,
  onSelect,
  onSell,
  onPurchase,
}: Props) {
  const [view, setView] = useState<PanelView>('inventory');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const selectedIds = new Set(selected.map(s => s.id));

  const sorted = useMemo(() => {
    return [...skins].sort((a, b) => (
      sortDir === 'desc' ? b.price - a.price : a.price - b.price
    ));
  }, [skins, sortDir]);

  return (
    <section className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-violet-500/10 bg-[#141024]/90 lg:min-h-[420px]">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-violet-500/10 bg-gradient-to-r from-violet-500/[0.08] to-transparent px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <PanelTabButton
            active={view === 'inventory'}
            label="Inventory"
            onClick={() => setView('inventory')}
          >
            <KnifeTabIcon />
          </PanelTabButton>
          <PanelTabButton
            active={view === 'shop'}
            label="Shop"
            onClick={() => setView('shop')}
          >
            <ShopTabIcon />
          </PanelTabButton>
        </div>

        {view === 'inventory' ? (
          <select
            value={sortDir}
            onChange={e => setSortDir(e.target.value as SortDir)}
            className="rounded-lg border border-white/10 bg-[#1a1530] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/60 outline-none"
          >
            <option value="desc">Price ↓</option>
            <option value="asc">Price ↑</option>
          </select>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent px-2.5 py-1.5 shadow-[0_0_18px_rgba(176,108,255,0.12)]">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">Saldo</span>
            <CoinPrice
              value={balance}
              iconClassName="h-3.5 w-3.5"
              textClassName="font-display text-xs font-bold text-gold"
            />
          </div>
        )}
      </div>

      {view === 'inventory' ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          {skins.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-4 text-center">
              <p className="text-sm font-semibold text-white/55">You have no available items yet</p>
              <p className="mt-2 text-xs text-white/35">Open cases, buy skins in the shop, or upgrade an item</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateApp('main')}
                  className="rounded-full bg-gradient-to-r from-[#ec4899] via-[#d946ef] to-[#c026d3] px-8 py-3 font-display text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_4px_28px_rgba(236,72,153,0.4)] transition hover:brightness-110"
                >
                  Open cases
                </button>
                <button
                  type="button"
                  onClick={() => setView('shop')}
                  className="rounded-full border border-violet-500/30 bg-violet-500/10 px-8 py-3 font-display text-xs font-black uppercase tracking-[0.12em] text-violet-200 transition hover:border-violet-500/50 hover:bg-violet-500/20"
                >
                  Shop
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
              {sorted.map(skin => {
                const rolling = upgradeRollingIds?.has(skin.id) ?? false;
                const withdrawLocked = lockedSkinIds?.has(skin.id) ?? false;
                const locked = rolling || withdrawLocked;
                return (
                  <SkinCard
                    key={skin.id}
                    skin={skin}
                    selected={selectedIds.has(skin.id)}
                    locked={locked}
                    lockLabel={rolling ? 'Rolling' : 'Withdraw'}
                    onSelect={onSelect}
                    onSell={onSell}
                  />
                );
              })}
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
