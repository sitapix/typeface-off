import type { Font, FontCategory } from './fonts';

/**
 * Quiz-roster construction. The Game offers two deterministic brackets per
 * category, so a result stays comparable across players:
 *
 *   Quick — the top-N most popular Google fonts. The catalog is generated in
 *           Google-Fonts popularity order and tags Google families source
 *           'bunny', so "most popular" is simply the bunny fonts in array order.
 *   Full  — every popular Google font, then every self-hosted font, then curated
 *           catalog extras (Fontsource gems named in featured.ts).
 *
 * A self-hosted font joins Full automatically: you host it to play it, so
 * there's no second list to maintain. featured.ts is only for promoting
 * auto-generated catalog fonts (Fontsource) that popularity didn't pull in.
 *
 * Pure (no component state) so it's unit tested and the view stays thin.
 */

/** Default Quick-mode bracket size. */
export const QUICK_SIZE = 24;

/** Popular Google fonts for a category, in popularity order (source 'bunny'). */
export function popularFonts(fonts: Font[], category: FontCategory): Font[] {
  return fonts.filter((f) => f.category === category && f.source === 'bunny');
}

/** Self-hosted fonts for a category, in catalog order (source 'local'). */
export function selfHostedFonts(fonts: Font[], category: FontCategory): Font[] {
  return fonts.filter((f) => f.category === category && f.source === 'local');
}

/**
 * Curated extras for Full mode: `names` resolved to catalog fonts of the
 * category, dropping unknown names plus any already in Full via another path
 * (popular Google fonts and self-hosted fonts). So featured.ts only needs the
 * Fontsource promotions. Input order is preserved for seeding.
 */
export function curatedExtras(
  fonts: Font[],
  category: FontCategory,
  names: readonly string[] = []
): Font[] {
  const inCategory = fonts.filter((f) => f.category === category);
  const alreadyIn = new Set([
    ...popularFonts(fonts, category).map((f) => f.family),
    ...selfHostedFonts(fonts, category).map((f) => f.family)
  ]);
  return names
    .map((name) => inCategory.find((f) => f.family === name))
    .filter((f): f is Font => !!f && !alreadyIn.has(f.family));
}

/** Quick bracket: the top `size` popular fonts. */
export function quickRoster(
  fonts: Font[],
  category: FontCategory,
  size: number = QUICK_SIZE
): Font[] {
  return popularFonts(fonts, category).slice(0, size);
}

/** Full bracket: every popular font, then every self-hosted font, then extras. */
export function fullRoster(
  fonts: Font[],
  category: FontCategory,
  names: readonly string[] = []
): Font[] {
  return [
    ...popularFonts(fonts, category),
    ...selfHostedFonts(fonts, category),
    ...curatedExtras(fonts, category, names)
  ];
}
