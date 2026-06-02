/**
 * Single source of truth for turning a font family name into a URL slug and
 * matching one back. The route loader ([slug]/+page.ts) and every link that
 * points at a font detail page MUST go through these so they can never drift.
 *
 * Rule: drop all whitespace, then percent-encode. `fontSlug` is for building
 * hrefs; `matchesSlug` compares a decoded slug back to a family (the encoding
 * is reversed by the router before it reaches the loader).
 */
export function fontSlug(family: string): string {
  return encodeURIComponent(family.replace(/\s+/g, ''));
}

/** True when a decoded URL slug refers to `family`. See {@link fontSlug}. */
export function matchesSlug(family: string, decodedSlug: string): boolean {
  return family.replace(/\s+/g, '') === decodedSlug;
}
