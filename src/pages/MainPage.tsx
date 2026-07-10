import { useMemo, useState, type MouseEvent } from 'react';
import { navigateApp, navigateCase } from '../lib/appRoute';
import { CASE_CATALOG, type CatalogCase } from '../lib/caseCatalog';
import {
  DEFAULT_CASE_CATALOG_FILTERS,
  filterCatalogCases,
} from '../lib/caseCatalogFilters';
import { catalogCaseToTier, pathForCaseSlug } from '../lib/catalogCaseUi';
import { FreeCasePortada } from '../components/freecases/FreeCaseCover';
import { CaseCatalogFilterBar } from '../components/cases/CaseCatalogFilterBar';
const CAVE_BANNER_URL = '/upgradercave.jpg';
const BANNER_WIDTH = 2172;
const BANNER_HEIGHT = 724;

function CaseCatalogCard({ item }: { item: CatalogCase }) {
  const tier = catalogCaseToTier(item);
  const href = pathForCaseSlug(item.slug);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateCase(item.slug);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="group block w-full cursor-pointer transition duration-200 hover:scale-[1.02] hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
      aria-label={`Abrir ${item.name}`}
    >
      <FreeCasePortada tier={tier} catalogGrid title={item.name} price={item.price} />
    </a>
  );
}

const CASE_GRID_CLASS =
  'mx-auto grid w-full max-w-[1520px] grid-cols-2 justify-center px-2 sm:grid-cols-3 sm:px-3 lg:grid-cols-4 lg:px-4 xl:grid-cols-5';

export function MainPage({ balance }: { balance: number }) {
  const featuredCases = CASE_CATALOG.slice(0, 5);
  const moreCases = CASE_CATALOG.slice(5);
  const [filters, setFilters] = useState(DEFAULT_CASE_CATALOG_FILTERS);

  const filteredCases = useMemo(
    () => filterCatalogCases(moreCases, filters, balance),
    [moreCases, filters, balance],
  );
  return (
    <div className="w-full pb-10">
      <section className="relative mx-auto mb-4 w-full max-w-[1520px] px-2 sm:mb-6 sm:px-3 lg:px-4">
        <div className="relative aspect-[2172/724] w-full overflow-hidden rounded-xl">
          <img
            src={CAVE_BANNER_URL}
            width={BANNER_WIDTH}
            height={BANNER_HEIGHT}
            alt="Upgrader Cave"
            className="h-full w-full object-cover object-center"
            decoding="sync"
            loading="eager"
            draggable={false}
          />

          <button
            type="button"
            onClick={() => navigateApp('upgrade')}
            className="absolute bottom-[11%] left-1/2 z-10 h-[12%] w-[18%] min-h-[1.75rem] max-w-[11rem] -translate-x-1/2 cursor-pointer rounded-md opacity-0 transition hover:bg-lime-400/10 hover:opacity-100 focus-visible:bg-lime-400/10 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-300"
            aria-label="Unirse al evento"
          />
        </div>
      </section>

      <div className={`${CASE_GRID_CLASS} gap-3 sm:gap-3.5 xl:gap-4`}>
        {featuredCases.map(item => (
          <CaseCatalogCard key={item.slug} item={item} />
        ))}
      </div>

      <div className="mt-6 sm:mt-8">
        <CaseCatalogFilterBar
          category={filters.category}
          onCategoryChange={category => setFilters(current => ({ ...current, category }))}
          priceFrom={filters.priceFrom}
          priceTo={filters.priceTo}
          onPriceFromChange={priceFrom => setFilters(current => ({ ...current, priceFrom }))}
          onPriceToChange={priceTo => setFilters(current => ({ ...current, priceTo }))}
          affordableOnly={filters.affordableOnly}
          onAffordableChange={affordableOnly => setFilters(current => ({ ...current, affordableOnly }))}
          priceSort={filters.priceSort}
          onPriceSortToggle={() =>
            setFilters(current => ({
              ...current,
              priceSort: current.priceSort === 'desc' ? 'asc' : 'desc',
            }))
          }
        />
      </div>

      <div
        className={`${CASE_GRID_CLASS} mt-10 gap-x-4 gap-y-14 sm:mt-12 sm:gap-x-5 sm:gap-y-16 lg:mt-14 lg:gap-x-6 lg:gap-y-20 xl:gap-y-24`}
      >
        {filteredCases.length > 0 ? (
          filteredCases.map(item => (
            <CaseCatalogCard key={item.slug} item={item} />
          ))
        ) : (
          <p className="col-span-full py-16 text-center font-display text-sm font-bold uppercase tracking-[0.12em] text-white/35">
            No hay cajas con estos filtros
          </p>
        )}      </div>
    </div>
  );
}
