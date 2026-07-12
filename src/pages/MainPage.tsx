import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { navigateApp, navigateCase } from '../lib/appRoute';
import { CASE_CATALOG, type CatalogCase } from '../lib/caseCatalog';
import {
  DEFAULT_CASE_CATALOG_FILTERS,
  FIFTY_FIFTY_Z_CASE_SLUGS,
  HIGH_RISK_CASE_SLUGS,
  LOW_RISK_CASE_SLUGS,
  BATTLES_CASE_SLUGS,
  MIXED_CASE_SLUGS,
  getCategoryScrollTarget,
  matchesCasePriceFilters,
  FEATURED_CASE_SLUGS,
  resolveCasesInOrder,
  resolveSectionCases,
  sortCasesByPrice,
  type CaseCategory,
  type CaseSectionId,
} from '../lib/caseCatalogFilters';
import { catalogCaseToTier, pathForCaseSlug } from '../lib/catalogCaseUi';
import { FreeCasePortada } from '../components/freecases/FreeCaseCover';
import { CaseCatalogFilterBar } from '../components/cases/CaseCatalogFilterBar';
import { CaseCatalogSection } from '../components/cases/CaseCatalogSection';
import { scrollToPageTop, scrollToSectionById } from '../lib/scrollToSection';
const CAVE_BANNER_URL = '/upgradercave.jpg';
const BANNER_WIDTH = 2172;
const BANNER_HEIGHT = 724;

function CaseCatalogCard({
  item,
  titleSuffix,
}: {
  item: CatalogCase;
  titleSuffix?: string;
}) {
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
      aria-label={`Open ${item.name}`}
    >
      <FreeCasePortada
        tier={tier}
        catalogGrid
        title={item.name}
        titleSuffix={titleSuffix}
        price={item.price}
      />
    </a>
  );
}

const CASE_GRID_CLASS =
  'mx-auto grid w-full max-w-[1520px] grid-cols-2 justify-center gap-2 px-2 max-lg:pb-4 sm:grid-cols-3 sm:gap-3 sm:px-3 lg:grid-cols-4 lg:gap-3.5 lg:px-4 xl:grid-cols-5 xl:gap-4';

const DEFAULT_SECTION_OPEN: Record<CaseSectionId, boolean> = {
  'fifty-fifty': true,
  'high-risk': true,
  'low-risk': true,
  battles: true,
  mixed: true,
};

function CaseGrid({
  cases,
  titleSuffix,
  emptyMessage = 'No cases match these filters',
}: {
  cases: CatalogCase[];
  titleSuffix?: string;
  emptyMessage?: string;
}) {
  if (cases.length === 0) {
    return (
      <p className="py-16 text-center font-display text-sm font-bold uppercase tracking-[0.12em] text-white/35">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={`${CASE_GRID_CLASS} gap-3 sm:gap-3.5 xl:gap-4`}>
      {cases.map(item => (
        <CaseCatalogCard key={item.slug} item={item} titleSuffix={titleSuffix} />
      ))}
    </div>
  );
}

export function MainPage({ balance }: { balance: number }) {
  const [filters, setFilters] = useState(DEFAULT_CASE_CATALOG_FILTERS);
  const [sectionOpen, setSectionOpen] = useState(DEFAULT_SECTION_OPEN);
  const [pendingScrollTarget, setPendingScrollTarget] = useState<'top' | CaseSectionId | null>(null);

  const applyFeaturedFilters = useMemo(
    () => (cases: CatalogCase[]) =>
      cases.filter(item => matchesCasePriceFilters(item, filters, balance)),
    [balance, filters.affordableOnly, filters.priceFrom, filters.priceTo],
  );

  const applySectionFilters = useMemo(
    () => (cases: CatalogCase[]) =>
      sortCasesByPrice(
        cases.filter(item => matchesCasePriceFilters(item, filters, balance)),
        'asc',
      ),
    [balance, filters.affordableOnly, filters.priceFrom, filters.priceTo],
  );

  const featuredCases = useMemo(
    () => applyFeaturedFilters(resolveCasesInOrder(FEATURED_CASE_SLUGS, CASE_CATALOG)),
    [applyFeaturedFilters],
  );

  const fiftyFiftyCases = useMemo(
    () => applySectionFilters(resolveSectionCases(FIFTY_FIFTY_Z_CASE_SLUGS, CASE_CATALOG)),
    [applySectionFilters],
  );

  const highRiskCases = useMemo(
    () => applySectionFilters(resolveSectionCases(HIGH_RISK_CASE_SLUGS, CASE_CATALOG)),
    [applySectionFilters],
  );

  const lowRiskCases = useMemo(
    () => applySectionFilters(resolveSectionCases(LOW_RISK_CASE_SLUGS, CASE_CATALOG)),
    [applySectionFilters],
  );

  const battlesCases = useMemo(
    () => applySectionFilters(resolveSectionCases(BATTLES_CASE_SLUGS, CASE_CATALOG)),
    [applySectionFilters],
  );

  const mixedCases = useMemo(
    () => applySectionFilters(resolveSectionCases(MIXED_CASE_SLUGS, CASE_CATALOG)),
    [applySectionFilters],
  );
  const mixedTopCases = mixedCases.slice(0, 5);
  const mixedBottomCase = mixedCases[5];
  const emptyFilterMessage = filters.affordableOnly
    ? 'No cases you can open with your current balance'
    : 'No cases match these filters';

  const handleCategoryChange = (category: CaseCategory) => {
    setFilters(current => ({ ...current, category }));

    const target = getCategoryScrollTarget(category);
    if (target !== 'top') {
      setSectionOpen(current => ({ ...current, [target]: true }));
    }

    setPendingScrollTarget(target);
  };

  useEffect(() => {
    if (pendingScrollTarget === null) return;

    if (pendingScrollTarget === 'top') {
      scrollToPageTop();
    } else {
      scrollToSectionById(`case-section-${pendingScrollTarget}`);
    }

    setPendingScrollTarget(null);
  }, [pendingScrollTarget, sectionOpen]);

  return (
    <div className="w-full pb-10 max-lg:pb-28">
      <section className="relative mx-auto mb-3 w-full max-w-[1520px] px-2 sm:mb-6 sm:px-3 lg:px-4">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-xl sm:aspect-[2172/724]">
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
            aria-label="Join event"
          />
        </div>
      </section>

      {featuredCases.length > 0 ? (
        <CaseGrid cases={featuredCases} />
      ) : null}

      <div className="mt-6 sm:mt-8">
        <CaseCatalogFilterBar
          category={filters.category}
          onCategoryChange={handleCategoryChange}
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

      <div className="mt-10 sm:mt-12 lg:mt-14">
        <CaseCatalogSection
          variant="fifty-fifty"
          sectionId="case-section-fifty-fifty"
          open={sectionOpen['fifty-fifty']}
          onOpenChange={open => setSectionOpen(current => ({ ...current, 'fifty-fifty': open }))}
        >
          <CaseGrid cases={fiftyFiftyCases} titleSuffix="50%" emptyMessage={emptyFilterMessage} />
        </CaseCatalogSection>
      </div>

      <div className="mt-16 sm:mt-20 lg:mt-24">
        <CaseCatalogSection
          variant="high-risk"
          sectionId="case-section-high-risk"
          open={sectionOpen['high-risk']}
          onOpenChange={open => setSectionOpen(current => ({ ...current, 'high-risk': open }))}
        >
          <CaseGrid cases={highRiskCases} emptyMessage={emptyFilterMessage} />
        </CaseCatalogSection>
      </div>

      <div className="mt-16 sm:mt-20 lg:mt-24">
        <CaseCatalogSection
          variant="low-risk"
          sectionId="case-section-low-risk"
          open={sectionOpen['low-risk']}
          onOpenChange={open => setSectionOpen(current => ({ ...current, 'low-risk': open }))}
        >
          <CaseGrid cases={lowRiskCases} emptyMessage={emptyFilterMessage} />
        </CaseCatalogSection>
      </div>

      <div className="mt-16 sm:mt-20 lg:mt-24">
        <CaseCatalogSection
          variant="battles"
          sectionId="case-section-battles"
          open={sectionOpen.battles}
          onOpenChange={open => setSectionOpen(current => ({ ...current, battles: open }))}
        >
          <CaseGrid cases={battlesCases} />
        </CaseCatalogSection>
      </div>

      <div className="mt-16 sm:mt-20 lg:mt-24">
        <CaseCatalogSection
          variant="mixed"
          sectionId="case-section-mixed"
          open={sectionOpen.mixed}
          onOpenChange={open => setSectionOpen(current => ({ ...current, mixed: open }))}
        >
          {mixedCases.length > 0 ? (
            <div className={`${CASE_GRID_CLASS} -mt-1 gap-3 sm:gap-3.5 xl:gap-4`}>
              {mixedTopCases.map(item => (
                <CaseCatalogCard key={item.slug} item={item} />
              ))}
              {mixedBottomCase ? (
                <div className="col-span-2 flex justify-center sm:col-span-3 lg:col-span-4 xl:col-span-1 xl:col-start-3 xl:block">
                  <div className="w-full max-w-[11.5rem] sm:max-w-none">
                    <CaseCatalogCard item={mixedBottomCase} />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="py-16 text-center font-display text-sm font-bold uppercase tracking-[0.12em] text-white/35">
              No cases match these filters
            </p>
          )}
        </CaseCatalogSection>
      </div>
    </div>
  );
}
