import { useEffect, useMemo, useState } from 'react';
import { CASE_CATALOG, type CatalogCase } from '../../lib/caseCatalog';
import {
  BATTLE_MAX_CASE_COUNT,
  type BattleCaseSlot,
} from '../../lib/caseBattlesStorage';
import {
  CASE_PICKER_SECTIONS,
  battleSlotsTotalCount,
  caseSlotQuantity,
  findBattleSlotIndex,
} from '../../lib/caseBattleCatalog';
import { resolveSectionCases } from '../../lib/caseCatalogFilters';
import { catalogCaseToTier } from '../../lib/catalogCaseUi';
import { getJokerCasePrice } from '../../lib/freeCaseLoot';
import { CoinPrice } from '../ui/CoinPrice';
import { BattleCaseQuantitySelector } from './BattleCaseQuantitySelector';

interface Props {
  open: boolean;
  balance: number;
  selectedCases: BattleCaseSlot[];
  onClose: () => void;
  onChangeSelectedCases: (cases: BattleCaseSlot[]) => void;
}

type PriceTab = 'standard' | 'joker';

function slotSelectionKey(slug: string, joker: boolean): string {
  return `${slug}:${joker}`;
}

function parseSelectionKey(key: string): { slug: string; joker: boolean } | null {
  const separator = key.lastIndexOf(':');
  if (separator === -1) return null;
  return {
    slug: key.slice(0, separator),
    joker: key.slice(separator + 1) === 'true',
  };
}

function CasePickerCard({
  item,
  joker,
  quantity,
  selectedQuantity,
  selected,
  active,
  maxQuantity,
  atGlobalLimit,
  onSelect,
  onRemove,
  onQuantityChange,
}: {
  item: CatalogCase;
  joker: boolean;
  quantity: number;
  selectedQuantity: number;
  selected: boolean;
  active: boolean;
  maxQuantity: number;
  atGlobalLimit: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}) {
  const tier = catalogCaseToTier(item);
  const price = joker ? getJokerCasePrice(item.slug) : item.price;

  return (
    <div
      className={`group relative flex w-40 shrink-0 flex-col overflow-hidden rounded-xl border bg-[#171a22] transition sm:w-44 lg:w-48 ${
        active
          ? 'border-violet-400/70 ring-1 ring-violet-400/30'
          : selected
            ? 'border-lime-400/40'
            : 'border-white/10 hover:border-lime-400/40 hover:brightness-110'
      }`}
    >
      {(active || selected) && (
        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            onRemove();
          }}
          className="absolute left-2 top-2 z-20 rounded bg-black/75 px-1.5 py-0.5 font-display text-[11px] font-black text-white/80 transition hover:text-white"
          aria-label="Remove case"
        >
          ×
        </button>
      )}

      <button
        type="button"
        onClick={onSelect}
        disabled={!selected && !active && atGlobalLimit}
        className="flex flex-col disabled:cursor-not-allowed disabled:opacity-45"
      >
        <div className="absolute right-2 top-2 z-10 rounded bg-black/70 px-2 py-1">
          <CoinPrice
            value={price}
            iconClassName="h-3 w-3"
            textClassName="font-display text-[11px] font-black text-white"
          />
        </div>

        {selected && (
          <div className="absolute right-2 top-10 z-10 rounded bg-lime-400 px-2 py-0.5 font-display text-[11px] font-black text-[#10140f]">
            ×{selectedQuantity}
          </div>
        )}

        <div className="relative h-44 overflow-hidden bg-[#12101c] sm:h-48 lg:h-52">
          {tier.image ? (
            <img
              src={tier.image}
              alt=""
              className="h-full w-full object-cover object-center transition group-hover:scale-105"
              draggable={false}
            />
          ) : null}
          {joker && (
            <span className="absolute bottom-2 left-2 rounded bg-violet-600/90 px-2 py-0.5 font-display text-[9px] font-black uppercase tracking-wide text-white">
              Joker
            </span>
          )}
        </div>

        <div className="border-t border-white/10 px-3 py-2.5">
          <p className="truncate text-center font-display text-[11px] font-black uppercase tracking-[0.08em] text-white/85 sm:text-xs">
            {item.name}
          </p>
        </div>
      </button>

      {active && (
        <div className="border-t border-white/10 bg-[#0f0d18] px-3 py-2.5">
          <BattleCaseQuantitySelector
            compact
            value={quantity}
            max={maxQuantity}
            onChange={onQuantityChange}
          />
        </div>
      )}
    </div>
  );
}

export function BattleCasePickerModal({
  open,
  balance,
  selectedCases,
  onClose,
  onChangeSelectedCases,
}: Props) {
  const [search, setSearch] = useState('');
  const [priceTab, setPriceTab] = useState<PriceTab>('standard');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(5000);
  const [affordableOnly, setAffordableOnly] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) {
      setActiveKey(null);
      setDraftQuantities({});
    }
  }, [open]);

  const totalSelected = useMemo(() => battleSlotsTotalCount(selectedCases), [selectedCases]);
  const atGlobalLimit = totalSelected >= BATTLE_MAX_CASE_COUNT;

  const maxCatalogPrice = useMemo(
    () => Math.max(...CASE_CATALOG.map(item => item.price), 5000),
    [],
  );

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    const joker = priceTab === 'joker';

    return CASE_PICKER_SECTIONS.map(section => {
      const cases = resolveSectionCases(section.slugs, CASE_CATALOG).filter(item => {
        const price = joker ? getJokerCasePrice(item.slug) : item.price;
        if (query && !item.name.toLowerCase().includes(query)) return false;
        if (price < priceMin || price > priceMax) return false;
        if (affordableOnly && price > balance) return false;
        return true;
      });

      return { ...section, cases };
    }).filter(section => section.cases.length > 0);
  }, [affordableOnly, balance, priceMax, priceMin, priceTab, search]);

  const removeSlot = (slug: string, joker: boolean) => {
    const key = slotSelectionKey(slug, joker);
    onChangeSelectedCases(selectedCases.filter(slot => !(slot.slug === slug && slot.joker === joker)));
    setDraftQuantities(current => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setActiveKey(current => (current === key ? null : current));
  };

  const upsertSlot = (slug: string, joker: boolean, quantity: number) => {
    const index = findBattleSlotIndex(selectedCases, slug, joker);
    const key = slotSelectionKey(slug, joker);

    if (index === -1) {
      if (totalSelected + quantity > BATTLE_MAX_CASE_COUNT) return;
      onChangeSelectedCases([...selectedCases, { slug, joker, quantity }]);
    } else {
      const otherCount = totalSelected - caseSlotQuantity(selectedCases[index]);
      const cappedQuantity = Math.min(quantity, BATTLE_MAX_CASE_COUNT - otherCount);
      onChangeSelectedCases(
        selectedCases.map((slot, slotIndex) =>
          slotIndex === index ? { ...slot, quantity: cappedQuantity } : slot,
        ),
      );
    }

    setDraftQuantities(current => ({ ...current, [key]: quantity }));
  };

  const commitActiveDraft = () => {
    if (!activeKey) return;

    const parsed = parseSelectionKey(activeKey);
    if (!parsed) return;

    const draft = draftQuantities[activeKey] ?? 1;
    const index = findBattleSlotIndex(selectedCases, parsed.slug, parsed.joker);

    if (draft >= 1 && index === -1) {
      upsertSlot(parsed.slug, parsed.joker, draft);
    }
  };

  const handleClose = () => {
    commitActiveDraft();
    onClose();
  };

  const handleQuantityChange = (slug: string, joker: boolean, quantity: number) => {
    const key = slotSelectionKey(slug, joker);

    if (quantity < 1) {
      removeSlot(slug, joker);
      return;
    }

    setDraftQuantities(current => ({ ...current, [key]: quantity }));
    upsertSlot(slug, joker, quantity);
  };

  const handleSelectCase = (slug: string, joker: boolean) => {
    const key = slotSelectionKey(slug, joker);
    const index = findBattleSlotIndex(selectedCases, slug, joker);

    if (index === -1) {
      if (atGlobalLimit) return;
      upsertSlot(slug, joker, 1);
    }

    setActiveKey(key);
    setDraftQuantities(current => ({
      ...current,
      [key]: index === -1 ? 1 : caseSlotQuantity(selectedCases[index]),
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/75 p-2 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-[1400px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#12101c] shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
          <div>
            <h2 className="font-display text-sm font-black uppercase tracking-[0.12em] text-white sm:text-base">
              Add cases to create Case Battle
            </h2>
            <p className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
              {totalSelected}/{BATTLE_MAX_CASE_COUNT} cases
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-2 text-white/45 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <label className="relative min-w-[12rem] flex-1">
                <span className="sr-only">Search</span>
                <input
                  type="text"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search"
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#171a22] pl-9 pr-3 font-display text-xs font-bold uppercase tracking-wide text-white placeholder:text-white/25 focus:border-lime-400/40 focus:outline-none"
                />
                <svg viewBox="0 0 16 16" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" fill="currentColor" aria-hidden="true">
                  <path d="M7 2a5 5 0 1 0 3.47 8.76l2.53 2.53.71-.71-2.53-2.53A5 5 0 0 0 7 2Zm0 1a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
                </svg>
              </label>

              <div className="inline-flex rounded-lg border border-white/10 bg-[#171a22] p-1">
                <button
                  type="button"
                  onClick={() => setPriceTab('standard')}
                  className={`rounded-md px-3 py-2 font-display text-[10px] font-black uppercase tracking-[0.1em] ${
                    priceTab === 'standard' ? 'bg-[#252a38] text-white' : 'text-white/45'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setPriceTab('joker')}
                  className={`rounded-md px-3 py-2 font-display text-[10px] font-black uppercase tracking-[0.1em] ${
                    priceTab === 'joker' ? 'bg-violet-600 text-white' : 'text-white/45'
                  }`}
                >
                  Joker
                </button>
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#171a22] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white/55">
                <span>Affordable</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={affordableOnly}
                  onClick={() => setAffordableOnly(value => !value)}
                  className={`relative h-5 w-9 rounded-full transition ${affordableOnly ? 'bg-violet-500' : 'bg-white/15'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${affordableOnly ? 'left-4' : 'left-0.5'}`} />
                </button>
              </label>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#171a22] px-3 py-2">
              <CoinPrice
                value={balance}
                textClassName="font-display text-sm font-black text-lime-300"
                iconClassName="h-3.5 w-3.5"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
              Choose price
            </span>
            <input
              type="range"
              min={0}
              max={maxCatalogPrice}
              value={priceMin}
              onChange={event => setPriceMin(Number(event.target.value))}
              className="w-28 accent-lime-400"
            />
            <input
              type="range"
              min={0}
              max={maxCatalogPrice}
              value={priceMax}
              onChange={event => setPriceMax(Number(event.target.value))}
              className="w-28 accent-lime-400"
            />
            <span className="font-display text-[10px] font-bold tabular-nums text-white/45">
              {priceMin} — {priceMax}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {filteredSections.map(section => (
            <section key={section.id} className="mb-7 last:mb-0">
              <h3 className="mb-4 font-display text-xs font-black uppercase tracking-[0.18em] text-white/55">
                {section.label}
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {section.cases.map(item => {
                  const joker = priceTab === 'joker';
                  const key = slotSelectionKey(item.slug, joker);
                  const index = findBattleSlotIndex(selectedCases, item.slug, joker);
                  const selected = index !== -1;
                  const selectedQuantity = selected ? caseSlotQuantity(selectedCases[index]) : 0;
                  const displayQuantity = activeKey === key
                    ? draftQuantities[key] ?? (selected ? selectedQuantity : 1)
                    : selectedQuantity || 1;
                  const otherCount = totalSelected - selectedQuantity;
                  const maxQuantity = BATTLE_MAX_CASE_COUNT - otherCount;

                  return (
                    <CasePickerCard
                      key={key}
                      item={item}
                      joker={joker}
                      quantity={displayQuantity}
                      selectedQuantity={selectedQuantity}
                      selected={selected}
                      active={activeKey === key}
                      maxQuantity={maxQuantity}
                      atGlobalLimit={atGlobalLimit}
                      onSelect={() => handleSelectCase(item.slug, joker)}
                      onRemove={() => removeSlot(item.slug, joker)}
                      onQuantityChange={nextQuantity => handleQuantityChange(item.slug, joker, nextQuantity)}
                    />
                  );
                })}
              </div>
            </section>
          ))}

          {filteredSections.length === 0 && (
            <p className="py-16 text-center font-display text-sm font-bold uppercase tracking-[0.12em] text-white/35">
              No cases match these filters
            </p>
          )}
        </div>

        <div className="border-t border-white/10 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            className="ml-auto flex rounded-lg bg-lime-400 px-4 py-2.5 font-display text-[11px] font-black uppercase tracking-[0.12em] text-[#10140f] transition hover:bg-lime-300"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
