import type { Font } from './fonts';

// Manual self-hosted font entries (advanced escape hatch).
//
// For most self-hosted fonts, prefer the easy YAML config:
//   1. Put file(s) in  static/fonts/
//   2. Add an entry to  scripts/local-fonts.yaml
//   3. Run  npm run fonts:local
// …which generates src/lib/localFonts.generated.ts.
//
// Use THIS file only when you need full control the YAML doesn't express. Entries
// here are never touched by any generator, and override a same-named font from
// the YAML pipeline or the Bunny/Fontsource catalog.
export const localFonts: Font[] = [];
