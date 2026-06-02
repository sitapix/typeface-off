import type { FontCategory } from './fonts';

/**
 * Hand-picked quiz rosters per category — distinctive, argue-worthy fonts that
 * make fun head-to-heads, deliberately BLENDING famous anchors, distinctive
 * mid-tier faces, and a few under-the-radar indies (so David-vs-Goliath fights
 * happen in one bracket).
 *
 * - The QUIZ draws from these; Browse still shows the full catalog.
 * - Order = seeding (index 0 is the top seed). Put the two most iconic first so
 *   they land in opposite halves and can only meet in the final; seed wildcards
 *   last for first-round upsets.
 * - A category with no list here falls back to top-by-popularity (zero risk).
 * - Names must exist in the catalog; unknown names are skipped.
 */
export const FEATURED: Partial<Record<FontCategory, string[]>> = {
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'IBM Plex Mono',
    'Source Code Pro',
    'Space Mono',
    'Geist Mono',
    'Commit Mono',
    'Maple Mono',
    'Monaspace Neon',
    'Iosevka',
    'Roboto Mono',
    'Inconsolata',
    'Anonymous Pro',
    'VT323',
    'Comic Mono',
    'Red Hat Mono'
  ],
  sans: [
    'Inter',
    'Geist Sans',
    'Space Grotesk',
    'Bricolage Grotesque',
    'Outfit',
    'Plus Jakarta Sans',
    'Manrope',
    'DM Sans',
    'Work Sans',
    'Jost',
    'Onest',
    'Figtree',
    'Uncut Sans',
    'Open Runde',
    'Oswald',
    'Bebas Neue'
  ]
};
