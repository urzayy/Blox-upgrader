import { CASE_CATALOG, type CatalogCase } from './caseCatalog';

export type CaseCategory =
  | 'all'
  | 'new'
  | 'featured'
  | 'regular'
  | 'cheap'
  | 'premium'
  | 'high-risk';

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
  priceSort: 'desc',
};

const FEATURED_SLUGS = new Set(CASE_CATALOG.slice(0, 5).map(item => item.slug));
const NEW_SLUGS = new Set(CASE_CATALOG.slice(-12).map(item => item.slug));

export const CASE_CATEGORIES: { id: CaseCategory; label: string; accent?: boolean }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'featured', label: 'Featured' },
  { id: 'regular', label: 'Regular' },
  { id: 'cheap', label: 'Cheap' },
  { id: 'premium', label: 'Premium', accent: true },
  { id: 'high-risk', label: 'High Risk' },
];

function parsePriceInput(value: string): number | null {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function matchesCaseCategory(item: CatalogCase, category: CaseCategory): boolean {
  switch (category) {
    case 'all':
      return true;
    case 'new':
      return NEW_SLUGS.has(item.slug);
    case 'featured':
      return FEATURED_SLUGS.has(item.slug);
    case 'regular':
      return item.tier === 'mid' || item.tier === 'budget';
    case 'cheap':
      return item.tier === 'budget' || item.price <= 15;
    case 'premium':
      return item.tier === 'premium' || item.tier === 'elite';
    case 'high-risk':
      return item.tier === 'knife' || item.tier === 'glove' || item.price >= 100;
    default:
      return true;
  }
}

export function filterCatalogCases(
  cases: CatalogCase[],
  filters: CaseCatalogFilterState,
  balance: number,
): CatalogCase[] {
  const minPrice = parsePriceInput(filters.priceFrom);
  const maxPrice = parsePriceInput(filters.priceTo);

  const filtered = cases.filter(item => {
    if (!matchesCaseCategory(item, filters.category)) return false;
    if (filters.affordableOnly && item.price > balance) return false;
    if (minPrice !== null && item.price < minPrice) return false;
    if (maxPrice !== null && item.price > maxPrice) return false;
    return true;
  });

  return [...filtered].sort((a, b) =>
    filters.priceSort === 'desc' ? b.price - a.price : a.price - b.price,
  );
}
