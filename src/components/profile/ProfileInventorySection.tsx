import { useMemo, useState } from 'react';
import { RARITY, type Skin } from '../../data/skins';
import { archiveReasonLabel, type ArchivedSkin } from '../../lib/inventoryArchiveStorage';
import { requestOpenWithdraw, requestUpgradeWithSkin } from '../../lib/uiActions';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from '../skins/SkinImage';
import { ProfileActiveSkinActionMenu } from './ProfileActiveSkinActionMenu';

interface Props {
  activeSkins: Skin[];
  archivedSkins: ArchivedSkin[];
  lockedSkinIds: ReadonlySet<string>;
  onSellSkin: (skin: Skin) => void;
}

export function ProfileInventorySection({
  activeSkins,
  archivedSkins,
  lockedSkinIds,
  onSellSkin,
}: Props) {
  const [activeDrops, setActiveDrops] = useState(true);
  const [sortPriceDesc, setSortPriceDesc] = useState(true);

  const visibleSkins = useMemo(() => {
    const list = activeDrops
      ? activeSkins.map(skin => ({ skin, archived: false as const }))
      : archivedSkins.map(skin => ({ skin, archived: true as const }));

    return [...list].sort((a, b) => (
      sortPriceDesc ? b.skin.price - a.skin.price : a.skin.price - b.skin.price
    ));
  }, [activeDrops, activeSkins, archivedSkins, sortPriceDesc]);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141024]/95">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-7 sm:py-5 lg:px-9">
        <h2 className="font-display text-base font-bold uppercase tracking-wide text-white lg:text-lg">Inventory</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-[#1a1530] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/60 lg:text-xs">
            <span>Active drops</span>
            <button
              type="button"
              role="switch"
              aria-checked={activeDrops}
              onClick={() => setActiveDrops(v => !v)}
              className={`relative h-6 w-11 rounded-full transition ${
                activeDrops ? 'bg-win' : 'bg-white/15'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  activeDrops ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </label>
          <button
            type="button"
            onClick={() => setSortPriceDesc(v => !v)}
            className="rounded-lg border border-white/10 bg-[#1a1530] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/55 hover:text-white lg:text-xs"
          >
            Price {sortPriceDesc ? '↓' : '↑'}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-7 lg:p-9">
        {visibleSkins.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center py-20 text-center lg:min-h-[340px]">
            <span className="text-5xl text-white/25 lg:text-6xl" aria-hidden="true">☹</span>
            <p className="mt-4 text-base font-semibold text-white/75 lg:text-lg">
              {activeDrops
                ? 'Your inventory is currently empty.'
                : 'No past skins to show yet.'}
            </p>
            <p className="mt-2 max-w-lg text-sm text-white/40 lg:text-base">
              {activeDrops
                ? 'Open one of our best-selling cases and start collecting skins today!'
                : 'Skins you upgrade, sell or withdraw will appear here as history.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {visibleSkins.map(({ skin, archived }) => (
              <ProfileInventoryCard
                key={`${archived ? 'archived' : 'active'}-${skin.id}`}
                skin={skin}
                archived={archived}
                locked={!archived && lockedSkinIds.has(skin.id)}
                statusLabel={archived ? archiveReasonLabel((skin as ArchivedSkin).reason) : undefined}
                onSell={onSellSkin}
                onUpgrade={requestUpgradeWithSkin}
                onWithdraw={s => requestOpenWithdraw([s.id])}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProfileInventoryCard({
  skin,
  archived,
  locked,
  statusLabel,
  onSell,
  onUpgrade,
  onWithdraw,
}: {
  skin: Skin;
  archived: boolean;
  locked?: boolean;
  statusLabel?: string;
  onSell: (skin: Skin) => void;
  onUpgrade: (skin: Skin) => void;
  onWithdraw: (skin: Skin) => void;
}) {
  const r = RARITY[skin.rarity];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      tabIndex={archived ? undefined : 0}
      onClick={() => {
        if (!archived) setMenuOpen(v => !v);
      }}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setMenuOpen(false);
        }
      }}
      className={`group relative aspect-[4/5] overflow-hidden rounded-lg border outline-none ${
        archived
          ? 'cursor-default border-white/10 opacity-75'
          : 'cursor-pointer border-white/10 focus-within:border-white/25'
      }`}
      style={{ boxShadow: archived ? undefined : `0 0 16px ${r.glow}` }}
    >
      <div className="absolute inset-x-0 top-0 z-10 h-0.5" style={{ background: r.color }} />
      <div
        className="absolute inset-0 opacity-25"
        style={{ background: `radial-gradient(circle at 50% 35%, ${r.color}, transparent 72%)` }}
      />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1530] via-[#141024] to-[#0a0814]" />
      <div className="absolute right-1.5 top-1.5 z-20 rounded-md border border-white/10 bg-black/60 px-1 py-0.5">
        <CoinPrice value={skin.price} iconClassName="h-2.5 w-2.5" textClassName="text-[8px] font-bold text-gold" />
      </div>
      <div className="absolute inset-x-0 top-1 bottom-10 z-[1]">
        <SkinImage src={skin.image} alt={skin.name} zoom={1.15} />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 to-transparent px-2 pb-2 pt-6">
        <p className="truncate text-[10px] font-semibold text-white">{skin.name}</p>
        <p className="truncate text-[9px] text-white/40">{skin.weapon}</p>
      </div>
      {!archived && (
        <ProfileActiveSkinActionMenu
          skin={skin}
          locked={locked}
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          onSell={onSell}
          onUpgrade={onUpgrade}
          onWithdraw={onWithdraw}
        />
      )}
      {archived && statusLabel && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35">
          <span className="rounded-md border border-white/15 bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white/80">
            {statusLabel}
          </span>
        </div>
      )}
    </div>
  );
}
