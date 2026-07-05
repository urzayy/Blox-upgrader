import { useMemo, useState } from 'react';
import { ALL_SKINS_CATALOG, RARITY, type Skin } from '../../data/skins';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from '../skins/SkinImage';
import { CartIcon, TrashIcon } from '../ui/PanelTabIcons';
import { sfx } from '../../lib/audio';

const PAGE_SIZE = 15;

export interface CatalogCartItem {
  skin: Skin;
  quantity: number;
}

interface Props {
  className?: string;
  submitLabel?: string;
  submitIcon?: 'cart' | 'chat';
  emptyError?: string;
  paginated?: boolean;
  priceSort?: 'asc' | 'desc';
  maxItemQuantity?: number;
  minSubmitTotal?: number;
  validateSubmit?: (items: CatalogCartItem[], total: number) => { ok: boolean; error?: string };
  onSubmit: (items: CatalogCartItem[]) => boolean | void | Promise<boolean | void>;
}

function wearShort(wear: string): string {
  const map: Record<string, string> = {
    'Factory New': 'FN',
    'Minimal Wear': 'MW',
    'Field-Tested': 'FT',
    'Well-Worn': 'WW',
    'Battle-Scarred': 'BS',
  };
  return map[wear] ?? wear.slice(0, 2).toUpperCase();
}

export function SkinCatalogCart({
  className = '',
  submitLabel,
  submitIcon = 'cart',
  emptyError = 'Selecciona al menos una skin.',
  paginated = true,
  priceSort = 'asc',
  maxItemQuantity = 99,
  minSubmitTotal,
  validateSubmit,
  onSubmit,
}: Props) {
  const [search, setSearch] = useState('');
  const [weaponFilter, setWeaponFilter] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(0);
  const [activeSkinId, setActiveSkinId] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const weapons = useMemo(
    () => ['All', ...Array.from(new Set(ALL_SKINS_CATALOG.map(s => s.weapon))).sort()],
    [],
  );

  const catalogById = useMemo(
    () => new Map(ALL_SKINS_CATALOG.map(s => [s.id, s])),
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minPrice.trim() ? Number(minPrice.replace(',', '.')) : null;
    const max = maxPrice.trim() ? Number(maxPrice.replace(',', '.')) : null;

    return ALL_SKINS_CATALOG.filter(s => {
      if (weaponFilter !== 'All' && s.weapon !== weaponFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.weapon.toLowerCase().includes(q)) return false;
      if (min !== null && Number.isFinite(min) && s.price < min) return false;
      if (max !== null && Number.isFinite(max) && s.price > max) return false;
      return true;
    }).sort((a, b) => (priceSort === 'desc' ? b.price - a.price : a.price - b.price));
  }, [search, weaponFilter, minPrice, maxPrice, priceSort]);

  const totalPages = paginated ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : 1;
  const safePage = paginated ? Math.min(page, totalPages - 1) : 0;
  const visibleItems = paginated
    ? filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
    : filtered;

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => {
        const skin = catalogById.get(id);
        return skin ? { skin, quantity } : null;
      })
      .filter((item): item is CatalogCartItem => item !== null);
  }, [cart, catalogById]);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.skin.price * item.quantity, 0),
    [cartItems],
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const belowMinTotal = minSubmitTotal != null && cartCount > 0 && cartTotal < minSubmitTotal;
  const canSubmit = cartCount > 0 && !belowMinTotal;

  const deselectSkin = (skinId: string) => {
    setCart(prev => {
      if (!(skinId in prev)) return prev;
      const next = { ...prev };
      delete next[skinId];
      return next;
    });
    setActiveSkinId(prev => (prev === skinId ? null : prev));
    setStatus(null);
    sfx.select();
  };

  const selectSkin = (skin: Skin) => {
    const inCart = (cart[skin.id] ?? 0) > 0;
    if (activeSkinId === skin.id && inCart) {
      deselectSkin(skin.id);
      return;
    }

    setActiveSkinId(skin.id);
    setCart(prev => ({ ...prev, [skin.id]: prev[skin.id] ?? 1 }));
    setStatus(null);
    sfx.select();
  };

  const changeQty = (skinId: string, delta: number) => {
    const current = cart[skinId] ?? 1;
    if (delta < 0 && current <= 1) {
      deselectSkin(skinId);
      return;
    }

    setCart(prev => ({
      ...prev,
      [skinId]: Math.min(maxItemQuantity, (prev[skinId] ?? 1) + delta),
    }));
    setActiveSkinId(skinId);
  };

  const clearCart = () => {
    setCart({});
    setActiveSkinId(null);
    setStatus(null);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!cartItems.length) {
      setStatus({ type: 'err', text: emptyError });
      return;
    }

    const validation = validateSubmit?.(cartItems, cartTotal);
    if (validation && !validation.ok) {
      setStatus({ type: 'err', text: validation.error ?? emptyError });
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit(cartItems);
      if (result === false) {
        setStatus({ type: 'err', text: 'No se pudo completar la acción.' });
        return;
      }
      clearCart();
      sfx.win();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/5 px-2 py-2">
        <select
          value={weaponFilter}
          onChange={e => {
            setWeaponFilter(e.target.value);
            setPage(0);
          }}
          className="input-filter max-w-[108px] py-1.5 text-[10px]"
        >
          {weapons.map(w => (
            <option key={w} value={w}>{w === 'All' ? 'All weapons' : w}</option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={minPrice}
          onChange={e => { setMinPrice(e.target.value); setPage(0); }}
          placeholder="Price"
          className="input-filter w-[72px] py-1.5 text-[10px]"
        />
        <span className="text-[10px] text-white/35">hasta</span>
        <input
          type="number"
          min={0}
          value={maxPrice}
          onChange={e => { setMaxPrice(e.target.value); setPage(0); }}
          placeholder="Max"
          className="input-filter w-[72px] py-1.5 text-[10px]"
        />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Buscar..."
          className="input-filter min-w-[88px] flex-1 py-1.5 text-[10px]"
        />
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold/35 bg-gold/10 text-gold">
          <CartIcon className="h-3.5 w-3.5" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[8px] font-black text-deep">
              {cartCount}
            </span>
          )}
        </div>
      </div>

      {status && (
        <p className={`mx-2 mt-2 shrink-0 rounded-lg px-3 py-1.5 text-[10px] ${
          status.type === 'ok'
            ? 'border border-win/25 bg-win/10 text-win'
            : 'border border-risk/25 bg-risk/10 text-risk'
        }`}
        >
          {status.text}
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {visibleItems.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/40">No hay skins con ese filtro.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] content-start items-start gap-2 sm:grid-cols-[repeat(auto-fill,minmax(124px,1fr))]">
            {visibleItems.map(skin => {
              const qty = cart[skin.id] ?? 0;
              const inCart = qty > 0;
              const active = activeSkinId === skin.id && inCart;
              return (
                <CatalogSkinTile
                  key={skin.id}
                  skin={skin}
                  selected={active}
                  inCart={inCart}
                  quantity={inCart ? qty : 0}
                  onSelect={() => selectSkin(skin)}
                  onChangeQty={delta => changeQty(skin.id, delta)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className={`flex shrink-0 flex-wrap items-center gap-2 border-t border-white/10 bg-[#0a0c12]/90 px-2 py-2 ${paginated ? 'justify-between' : 'justify-end'}`}>
        {paginated && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 transition enabled:hover:border-white/25 enabled:hover:text-white disabled:opacity-30"
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
            >
              ›
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {belowMinTotal && (
            <p className="text-[10px] font-semibold text-risk">
              Minimum {minSubmitTotal!.toLocaleString('en-US')} coins · {(minSubmitTotal! - cartTotal).toLocaleString('en-US')} more needed
            </p>
          )}
          <button
            type="button"
            disabled={!cartCount}
            onClick={clearCart}
            title="Vaciar selección"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#141820] text-white/45 transition enabled:hover:border-risk/30 enabled:hover:text-risk disabled:opacity-30"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          {submitIcon === 'cart' ? (
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={() => { void handleSubmit(); }}
              className="group relative flex min-w-[132px] items-center justify-between gap-2 overflow-hidden rounded-lg border border-gold/45 px-3 py-2 shadow-[0_0_24px_rgba(255,215,0,0.3)] transition enabled:hover:border-gold enabled:hover:shadow-[0_0_32px_rgba(255,215,0,0.45)] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#ffe566] via-[#ffcc00] to-[#ffb800] opacity-95"
              />
              <CoinPrice
                value={cartTotal}
                iconClassName="relative z-10 h-3.5 w-3.5"
                textClassName="relative z-10 font-display text-sm font-bold text-[#1a1400]"
              />
              <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-md bg-[#1a1400]/15 text-[#1a1400]">
                <CartIcon className="h-4 w-4" />
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={() => { void handleSubmit(); }}
              className="flex min-w-[148px] items-center justify-between gap-2 rounded-lg border border-gold/45 bg-gold/15 px-3 py-2 transition enabled:hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <CoinPrice
                value={cartTotal}
                iconClassName="h-3.5 w-3.5"
                textClassName="font-display text-sm font-bold text-gold"
              />
              <span className="font-display text-[10px] font-bold uppercase tracking-wide text-gold">
                {submitLabel ?? 'Confirmar'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CatalogSkinTile({
  skin,
  selected,
  inCart,
  quantity,
  onSelect,
  onChangeQty,
}: {
  skin: Skin;
  selected: boolean;
  inCart: boolean;
  quantity: number;
  onSelect: () => void;
  onChangeQty: (delta: number) => void;
}) {
  const r = RARITY[skin.rarity];

  return (
    <div
      className={`relative isolate w-full self-start overflow-hidden rounded-lg border bg-[#141820] ${
        selected
          ? 'border-gold ring-1 ring-gold/50 shadow-[0_0_18px_rgba(255,215,0,0.22)]'
          : inCart
            ? 'border-gold/35'
            : 'border-white/10 hover:border-white/25'
      }`}
    >
      <div className="absolute inset-x-0 top-0 z-10 h-0.5" style={{ background: r.color }} />

      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(circle at 50% 28%, ${r.color}, transparent 72%)` }}
      />

      <button
        type="button"
        onClick={onSelect}
        title={skin.name}
        className="relative block w-full text-left"
      >
        <div className="flex items-start justify-between gap-1 px-1.5 pt-1.5">
          <div className="max-w-[calc(100%-28px)] rounded bg-black/70 px-1 py-0.5">
            <CoinPrice
              value={skin.price}
              iconClassName="h-2.5 w-2.5"
              textClassName="text-[8px] font-bold text-gold font-display"
            />
          </div>
          <span className="shrink-0 rounded bg-black/70 px-1 py-0.5 text-[8px] font-bold text-white/55">
            {wearShort(skin.wear)}
          </span>
        </div>

        <div className="relative mx-auto aspect-square w-full max-h-[88px] overflow-hidden p-1">
          <SkinImage src={skin.image} alt={skin.name} zoom={1.1} />
        </div>

        <div className="border-t border-white/5 bg-black/40 px-1.5 py-1.5">
          <p className="line-clamp-2 min-h-[2rem] text-[9px] font-semibold leading-tight text-white/90">
            {skin.name}
          </p>
        </div>
      </button>

      {inCart && !selected && (
        <span className="absolute left-1.5 top-6 z-20 rounded-full bg-gold px-1.5 py-0.5 text-[8px] font-black text-deep">
          ×{quantity}
        </span>
      )}

      {selected && quantity > 0 && (
        <div className="absolute inset-x-2 bottom-[2.75rem] z-20 flex items-center justify-between rounded-full border border-white/15 bg-black/80 px-1 py-0.5 backdrop-blur-sm">
          <QtyButton label="−" onClick={() => onChangeQty(-1)} />
          <span className="min-w-[1.25rem] text-center font-display text-[11px] font-bold text-white">
            {quantity}
          </span>
          <QtyButton label="+" onClick={() => onChangeQty(1)} />
        </div>
      )}
    </div>
  );
}

function QtyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold leading-none text-white transition hover:bg-gold/25 hover:text-gold"
    >
      {label}
    </button>
  );
}
