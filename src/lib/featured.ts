import type { FontCategory } from './fonts';

/**
 * Catalog fonts to promote into the Game's Full bracket: the Fontsource gems
 * that popularity didn't pull in. The Game builds its brackets as:
 *
 *   Quick — the top-24 most popular Google fonts per category, straight from the
 *           catalog (generated in Google-Fonts popularity order). No curation.
 *   Full  — every popular Google font, then every self-hosted font, then the
 *           names below. Big on purpose.
 *
 * Only list catalog fonts you can't reach another way. You DON'T need to list:
 *   - popular Google families (they arrive automatically; deduped if you do)
 *   - self-hosted fonts (every source:'local' font joins Full automatically)
 * That leaves Fontsource fonts (e.g. Metropolis) as the one thing this list is
 * for. Names must exist in the catalog; unknown names are skipped. Browse always
 * shows the whole catalog regardless.
 *
 * Order is the seeding tail (populars seed first, then self-hosted, then these),
 * so earlier = stronger seed among the promotions. Quick ignores this list.
 */
export const FEATURED: Partial<Record<FontCategory, string[]>> = {
  sans: [
    'Geist Sans',
    'Uncut Sans',
    'Open Runde',
    'Hauora Sans',
    'Pretendard',
    'Metropolis',
    'Cooper Hewitt'
  ],
  serif: [
    'Libre Caslon Condensed',
    'Redaction',
    'Chunk Five',
    'Monaspace Xenon'
  ],
  mono: [
    'Maple Mono',
    'Monaspace Neon',
    'Comic Mono',
    'iA Writer Mono',
    'Monaspace Argon',
    'Iosevka Curly',
    'iA Writer Duo',
    'League Mono',
    'Monaspace Krypton',
    'Adwaita Mono',
    'Mononoki'
  ],
  display: ['Blackout Midnight'],
  script: ['Monaspace Radon']
};
