import type { Font } from './fonts';
import generatedFonts from './fonts';
import { localFonts } from './localFonts';
import { localGeneratedFonts } from './localFonts.generated';
import { withBase } from './fontFaces';
import { base } from '$app/paths';

// Merge self-hosted (local) fonts with the generated Bunny/Fontsource set.
// Precedence: manual localFonts > YAML-generated local fonts > Bunny/Fontsource
// catalog. A self-hosted family overrides a same-named catalog font.
const localAll: Font[] = [
  ...localFonts,
  ...localGeneratedFonts.filter(
    (g) => !localFonts.some((m) => m.family === g.family)
  )
];
const localFamilies = new Set(localAll.map((f) => f.family));

// Base-prefix self-hosted asset URLs (e.g. /fonts/x.ttf) so the Visit/Download
// links resolve on a GitHub Pages project site. Absolute http(s) URLs (Bunny /
// Fontsource) pass through `withBase` unchanged.
export const fonts: Font[] = [
  ...localAll,
  ...generatedFonts.filter((f) => !localFamilies.has(f.family))
].map((f) => ({
  ...f,
  siteUrl: withBase(f.siteUrl, base),
  downloadUrl: withBase(f.downloadUrl, base)
}));

const byFamily = new Map(fonts.map((f) => [f.family, f]));

/** O(1) lookup of a catalog font by exact family name. */
export function getFontByFamily(family: string | undefined): Font | undefined {
  return family ? byFamily.get(family) : undefined;
}
