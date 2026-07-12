import type { CatalogCase } from './caseCatalog';

export type CaseCategory =
  | 'all'
  | 'fifty-fifty'
  | 'high-risk'
  | 'low-risk'
  | 'battles'
  | 'mixed';

export type CaseSectionId =
  | 'fifty-fifty'
  | 'high-risk'
  | 'low-risk'
  | 'battles'
  | 'mixed';

export type CasePriceSort = 'desc' | 'asc';

export interface CaseCatalogFilterState {
  category: CaseCategory;
  priceFrom: string;
  priceTo: string;
  affordableOnly: boolean;
  priceSort: CasePriceSort;
}

export const DEFAULT_CASE_CATALOG_FILTERS: CaseCatalogFilterState = {
  category: 'all',
  priceFrom: '',
  priceTo: '',
  affordableOnly: false,
  priceSort: 'asc',
};

/** Event / featured row at the top of the main page. */
export const FEATURED_CASE_SLUGS = [
  'neon-district',
  'arctic-ops',
  'inferno-rush',
  'shadow-vault',
  'street-cache',
] as const;

export function resolveCasesInOrder(slugs: readonly string[], catalog: CatalogCase[]): CatalogCase[] {
  return slugs
    .map(slug => catalog.find(item => item.slug === slug))
    .filter((item): item is CatalogCase => Boolean(item));
}

export function resolveSectionCases(slugs: readonly string[], catalog: CatalogCase[]): CatalogCase[] {
  return sortCasesByPrice(
    slugs
      .map(slug => catalog.find(item => item.slug === slug))
      .filter((item): item is CatalogCase => Boolean(item)),
    'asc',
  );
}

/** Curated row shown in the 50/50 z section on the main page. */
export const FIFTY_FIFTY_Z_CASE_SLUGS = [
  'edge-protocol',
  'striker-knife',
  'sport-palm',
  'blade-roulette',
  'operator-wrap',
] as const;

export const FIFTY_FIFTY_Z_SLUG_SET = new Set<string>(FIFTY_FIFTY_Z_CASE_SLUGS);

/** Curated row shown in the High Risk section on the main page. */
export const HIGH_RISK_CASE_SLUGS = [
  'chrome-factory',
  'violet-storm',
  'ember-core',
  'toxic-alley',
  'midnight-run',
] as const;

export const HIGH_RISK_SLUG_SET = new Set<string>(HIGH_RISK_CASE_SLUGS);

/** Curated row shown in the Low Risk section on the main page. */
export const LOW_RISK_CASE_SLUGS = [
  'gold-reserve',
  'ruby-raid',
  'sapphire-code',
  'phantom-grid',
  'riot-zone',
] as const;

export const LOW_RISK_SLUG_SET = new Set<string>(LOW_RISK_CASE_SLUGS);

/** Curated row shown in the Battles section on the main page. */
export const BATTLES_CASE_SLUGS = [
  'cutlass-box',
  'kings-gambit',
  'apex-cache',
  'driver-lane',
  'hand-wraps-box',
] as const;

export const BATTLES_SLUG_SET = new Set<string>(BATTLES_CASE_SLUGS);

/** Curated row shown in the Mixed section on the main page. */
export const MIXED_CASE_SLUGS = [
  'sharpened',
  'mystery-hex',
  'night-market',
  'covert-reactor',
  'overdrive',
  'classified-hub',
] as const;

export const MIXED_SLUG_SET = new Set<string>(MIXED_CASE_SLUGS);

export const CASE_CATEGORIES: {
  id: CaseCategory;
  label: string;
  accent?: boolean;
  sectionId?: 'top' | CaseSectionId;
}[] = [
  { id: 'all', label: 'All', sectionId: 'top' },
  { id: 'fifty-fifty', label: '50/50', sectionId: 'fifty-fifty' },
  { id: 'high-risk', label: 'High Risk', sectionId: 'high-risk' },
  { id: 'low-risk', label: 'Low Risk', sectionId: 'low-risk' },
  { id: 'battles', label: 'Battles', sectionId: 'battles' },
  { id: 'mixed', label: 'Mixed', accent: true, sectionId: 'mixed' },
];

export function getCategoryScrollTarget(category: CaseCategory): 'top' | CaseSectionId {
  const item = CASE_CATEGORIES.find(entry => entry.id === category);
  return item?.sectionId ?? 'top';
}

export const CASE_SECTION_SCROLL_OFFSET = 88;

function parsePriceInput(value: string): number | null {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function canAffordCatalogCase(item: CatalogCase, balance: number): boolean {
  return item.price <= balance;
}

export function matchesCasePriceFilters(
  item: CatalogCase,
  filters: Pick<CaseCatalogFilterState, 'priceFrom' | 'priceTo' | 'affordableOnly'>,
  balance: number,
): boolean {
  const minPrice = parsePriceInput(filters.priceFrom);
  const maxPrice = parsePriceInput(filters.priceTo);

  if (filters.affordableOnly && !canAffordCatalogCase(item, balance)) return false;
  if (minPrice !== null && item.price < minPrice) return false;
  if (maxPrice !== null && item.price > maxPrice) return false;
  return true;
}

export function sortCasesByPrice(cases: CatalogCase[], priceSort: CasePriceSort): CatalogCase[] {
  return [...cases].sort((a, b) =>
    priceSort === 'desc' ? b.price - a.price : a.price - b.price,
  );
}

export function matchesCaseCategory(item: CatalogCase, category: CaseCategory): boolean {
  switch (category) {
    case 'all':
      return true;
    case 'fifty-fifty':
      return FIFTY_FIFTY_Z_SLUG_SET.has(item.slug);
    case 'high-risk':
      return HIGH_RISK_SLUG_SET.has(item.slug);
    case 'low-risk':
      return LOW_RISK_SLUG_SET.has(item.slug);
    case 'battles':
      return BATTLES_SLUG_SET.has(item.slug);
    case 'mixed':
      return MIXED_SLUG_SET.has(item.slug);
    default:
      return true;
  }
}

export function filterCatalogCases(
  cases: CatalogCase[],
  filters: CaseCatalogFilterState,
  balance: number,
): CatalogCase[] {
  const filtered = cases.filter(item => {
    if (!matchesCaseCategory(item, filters.category)) return false;
    if (!matchesCasePriceFilters(item, filters, balance)) return false;
    return true;
  });

  return sortCasesByPrice(filtered, filters.priceSort);
}
