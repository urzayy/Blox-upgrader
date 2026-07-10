import {
  CASE_CATEGORIES,
  type CaseCategory,
  type CasePriceSort,
} from '../../lib/caseCatalogFilters';

interface Props {
  category: CaseCategory;
  onCategoryChange: (category: CaseCategory) => void;
  priceFrom: string;
  priceTo: string;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  affordableOnly: boolean;
  onAffordableChange: (value: boolean) => void;
  priceSort: CasePriceSort;
  onPriceSortToggle: () => void;
}

function CategoryIcon({ id }: { id: CaseCategory }) {
  if (id === 'new') {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-amber-300" aria-hidden="true">
        <path fill="currentColor" d="M8 1.5 9.6 6h4.7l-3.8 2.8 1.5 4.7L8 10.7l-4 2.8 1.5-4.7L1.7 6h4.7L8 1.5z" />
      </svg>
    );
  }
  if (id === 'featured') {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-orange-400" aria-hidden="true">
        <path fill="currentColor" d="M8 1.2c.3 0 .6.2.7.5l1.4 3.5 3.7.3c.8.1 1.1 1 .6 1.6l-2.8 2.5.8 3.7c.2.8-.6 1.4-1.3 1l-3.2-1.9-3.2 1.9c-.7.4-1.5-.2-1.3-1l.8-3.7L1.6 7.1c-.5-.6-.2-1.5.6-1.6l3.7-.3 1.4-3.5c.1-.3.4-.5.7-.5z" />
      </svg>
    );
  }
  if (id === 'premium') {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-gold" aria-hidden="true">
        <path fill="currentColor" d="M8 2.2 9.8 6h4.1l-3.3 2.4 1.3 4-3.9-2.7L4.2 12.4l1.3-4L2.1 6h4.1L8 2.2z" />
      </svg>
    );
  }
  return null;
}

function PriceRangeInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-[4.5rem] rounded-lg border border-white/10 bg-[#0f0d18] px-2.5 text-center font-display text-xs font-bold text-white placeholder:text-white/25 focus:border-violet-500/40 focus:outline-none sm:w-[5.25rem] sm:text-sm"
      />
    </label>
  );
}

export function CaseCatalogFilterBar({
  category,
  onCategoryChange,
  priceFrom,
  priceTo,
  onPriceFromChange,
  onPriceToChange,
  affordableOnly,
  onAffordableChange,
  priceSort,
  onPriceSortToggle,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[1520px] px-2 sm:px-3 lg:px-4">
      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#12101c]/95 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3.5">
        <div className="min-w-0 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-1 sm:gap-1.5">
            {CASE_CATEGORIES.map(item => {
              const active = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onCategoryChange(item.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 font-display text-[11px] font-bold uppercase tracking-[0.08em] transition sm:px-3 sm:text-xs ${
                    active
                      ? 'bg-[#1c1830] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                      : item.accent
                        ? 'text-gold/80 hover:bg-white/[0.04] hover:text-gold'
                        : 'text-white/45 hover:bg-white/[0.04] hover:text-white/75'
                  }`}
                >
                  <CategoryIcon id={item.id} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1a1530] px-2.5 py-1.5">
            <PriceRangeInput
              value={priceFrom}
              onChange={onPriceFromChange}
              placeholder="From"
              label="Precio mínimo"
            />
            <span className="font-display text-xs font-bold text-white/30">—</span>
            <PriceRangeInput
              value={priceTo}
              onChange={onPriceToChange}
              placeholder="To"
              label="Precio máximo"
            />
          </div>

          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#1a1530] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/55 sm:text-xs">
            <span>Affordable</span>
            <button
              type="button"
              role="switch"
              aria-checked={affordableOnly}
              onClick={() => onAffordableChange(!affordableOnly)}
              className={`relative h-6 w-11 rounded-full transition ${
                affordableOnly ? 'bg-violet-500' : 'bg-white/15'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  affordableOnly ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </label>

          <button
            type="button"
            onClick={onPriceSortToggle}
            className="rounded-lg border border-white/10 bg-[#1a1530] px-3 py-2 font-display text-[11px] font-bold uppercase tracking-wide text-white/55 transition hover:text-white sm:text-xs"
          >
            Price {priceSort === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>
    </div>
  );
}
