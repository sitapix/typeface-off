import type { FontCategory } from './fonts';

export interface CategoryOption {
  id: FontCategory;
  label: string;
}

/**
 * The five real font categories, in catalog order, with display labels.
 * Single source for the UI — mirrors FontCategory in fonts.ts and CATEGORIES
 * in scripts/fonts-shared.cjs. The Game filters by these (a tournament only
 * makes sense within a category).
 */
export const CATEGORIES = [
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'script', label: 'Script' },
  { id: 'mono', label: 'Mono' }
] as const satisfies readonly CategoryOption[];

/** A category filter value: a real category or the 'all' catch-all. */
export type CategoryFilter = FontCategory | 'all';

/**
 * Category options including the 'all' catch-all — used by Browse, where the
 * category is just a table filter (unlike the Game, where 'all' makes no sense).
 */
export const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  ...CATEGORIES
] as const satisfies readonly { id: CategoryFilter; label: string }[];

/** Human label for a category (falls back to the id if unknown). */
export function categoryLabel(id: CategoryFilter): string {
  return CATEGORY_FILTERS.find((c) => c.id === id)?.label ?? id;
}
