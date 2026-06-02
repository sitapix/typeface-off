import type { Font } from './fonts';
import type { CategoryFilter } from './categories';

export type { CategoryFilter };

/**
 * Filter fonts by a search term (substring of the family name, case-insensitive)
 * and/or a category. Pure — used by Browse and the Game's type filter, and unit
 * tested.
 */
export function filterFonts(
  fonts: Font[],
  opts: { term?: string; category?: CategoryFilter } = {}
): Font[] {
  const term = (opts.term ?? '').trim().toLowerCase();
  const category = opts.category ?? 'all';
  return fonts.filter((font) => {
    const matchesTerm = !term || font.family.toLowerCase().includes(term);
    const matchesCategory = category === 'all' || font.category === category;
    return matchesTerm && matchesCategory;
  });
}
