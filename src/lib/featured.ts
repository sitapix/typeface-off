import type { FontCategory } from './fonts';

/**
 * Curated EXTRAS for the Game's Full (rigorous) mode — your hand-picked fonts
 * that AREN'T already popular Google fonts. The Game builds its brackets as:
 *
 *   Quick — the top-24 most popular Google fonts per category, straight from the
 *           catalog (generated in Google-Fonts popularity order). No curation.
 *   Full  — EVERY popular Google font PLUS the extras below. Big on purpose.
 *
 * So don't list popular Google families here: they arrive automatically (and are
 * deduped out if you do). List only what popularity misses — Fontsource gems
 * (e.g. Metropolis), self-hosted indies, and cross-category oddities. To add a
 * font to Full, drop its family name in the right bucket. Names must exist in the
 * catalog; unknown names are skipped. Browse still shows the whole catalog.
 *
 * Order is the Full-mode seeding tail (populars seed first, these follow), so
 * earlier = stronger seed among the extras. Quick is unaffected by this list.
 */
export const FEATURED: Partial<Record<FontCategory, string[]>> = {
  sans: [
    'Geist Sans',
    'Space Grotesk',
    'Uncut Sans',
    'Open Runde',
    'Hauora Sans',
    'Pretendard',
    'Metropolis',
    'Cooper Hewitt',
    'LINE Seed Sans',
    'Nimbus Sans L',
    'Karrik',
    'Techna Sans',
    'Hanken Round'
  ],
  serif: [
    'Libre Caslon Condensed',
    'Redaction',
    'Chunk Five',
    'Monaspace Xenon'
  ],
  mono: [
    'Commit Mono',
    'Maple Mono',
    'Monaspace Neon',
    'Iosevka',
    'Comic Mono',
    'iA Writer Mono',
    'Monaspace Argon',
    'Iosevka Curly',
    'iA Writer Duo',
    'League Mono',
    'Monaspace Krypton',
    'Adwaita Mono',
    'Mononoki',
    'Departure Mono',
    'Victor Mono',
    'Serious Shanns'
  ],
  display: ['Blackout Midnight'],
  script: ['Monaspace Radon']
};
