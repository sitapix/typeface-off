import type { Font, FontCategory } from './fonts';

/**
 * Quiz-roster construction. The Game offers two deterministic brackets per
 * category, so a result stays comparable across players:
 *
 *   Quick — the top-N most popular Google fonts. The catalog is generated in
 *           Google-Fonts popularity order and tags Google families source
 *           'bunny', so "most popular" is simply the bunny fonts in array order.
 *   Full  — every popular Google font PLUS curated non-Google extras (Fontsource
 *           gems, self-hosted indies), seeded after the populars.
 *
 * Pure (no component state) so it's unit tested and the view stays thin. The
 * extras list lives in featured.ts.
 */

/** Default Quick-mode bracket size. */
export const QUICK_SIZE = 24;

/** Popular Google fonts for a category, in popularity order (source 'bunny'). */
export function popularFonts(fonts: Font[], category: FontCategory): Font[] {
  return fonts.filter((f) => f.category === category && f.source === 'bunny');
}

/**
 * Curated extras for Full mode: `names` resolved to catalog fonts of the
 * category, dropping unknown names and any that are already popular Google fonts
 * (those arrive via popularFonts, so listing them would only duplicate). Input
 * order is preserved for seeding.
 */
export function curatedExtras(
  fonts: Font[],
  category: FontCategory,
  names: readonly string[] = []
): Font[] {
  const inCategory = fonts.filter((f) => f.category === category);
  const popular = new Set(popularFonts(fonts, category).map((f) => f.family));
  return names
    .map((name) => inCategory.find((f) => f.family === name))
    .filter((f): f is Font => !!f && !popular.has(f.family));
}

/** Quick bracket: the top `size` popular fonts. */
export function quickRoster(
  fonts: Font[],
  category: FontCategory,
  size: number = QUICK_SIZE
): Font[] {
  return popularFonts(fonts, category).slice(0, size);
}

/** Full bracket: every popular font, then the curated extras. */
export function fullRoster(
  fonts: Font[],
  category: FontCategory,
  names: readonly string[] = []
): Font[] {
  return [
    ...popularFonts(fonts, category),
    ...curatedExtras(fonts, category, names)
  ];
}
