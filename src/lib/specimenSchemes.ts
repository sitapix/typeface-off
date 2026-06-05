/**
 * Bold type-specimen colour schemes for the non-mono preview (the NotePreview
 * specimen shown in the Game and on Browse / detail). Each is a fixed
 * foreground/background pair that recolours the specimen the way a foundry
 * presents a face — reversed, on colour, on paper — so you judge how the
 * letterforms hold up against real grounds, not just the app surface.
 *
 * Theme-independent: the app's 12 Skeleton themes recolour the chrome, these
 * recolour only the specimen. Mono fonts use CodePreview and ignore these.
 * Every pair clears WCAG AA for normal text and links (the tightest, blue on
 * black, is ~5.1:1). Order is intentional — the swatch picker renders it as-is.
 */
export interface SpecimenScheme {
  /** Stable id — handy for {#each} keys (storage persists the index, not this). */
  id: string;
  /** Human label for the swatch's aria-label / tooltip. */
  label: string;
  /** Type colour. */
  fg: string;
  /** Ground colour. */
  bg: string;
  /** Link colour for rich specimen text — scheme-aware, ≥4.5:1 on `bg`. */
  link: string;
}

// `link` is per scheme: a hue distinct from the ink, ≥4.5:1 on `bg`. Vermilion's
// saturated ground only allows a deep navy.
export const SPECIMEN_SCHEMES: readonly SpecimenScheme[] = [
  {
    id: 'ink',
    label: 'Black on white',
    fg: '#000000',
    bg: '#ffffff',
    link: '#1a55c4'
  },
  {
    id: 'reverse',
    label: 'White on black',
    fg: '#ffffff',
    bg: '#000000',
    link: '#6ea8ff'
  },
  {
    id: 'charcoal',
    label: 'Warm white on charcoal',
    fg: '#f5f3ee',
    bg: '#17191f',
    link: '#7fd1c4'
  },
  {
    id: 'lime',
    label: 'Black on lime',
    fg: '#000000',
    bg: '#8ace00',
    link: '#11237a'
  },
  {
    id: 'vermilion',
    label: 'Black on vermilion',
    fg: '#000000',
    bg: '#fe531d',
    link: '#06164f'
  },
  {
    id: 'indigo',
    label: 'White on indigo',
    fg: '#ffffff',
    bg: '#593eff',
    link: '#9af7ef'
  },
  {
    id: 'klein',
    label: 'Blue on off-white',
    fg: '#1c26fd',
    bg: '#f3f1ea',
    link: '#b3122f'
  },
  {
    id: 'azure',
    label: 'Blue on black',
    fg: '#0078ff',
    bg: '#000000',
    link: '#fbbf24'
  },
  {
    id: 'sun',
    label: 'Black on yellow',
    fg: '#000000',
    bg: '#ffeb01',
    link: '#1730b8'
  }
] as const;

/** The scheme at `index`, clamped into range (defaults to the first). */
export function schemeAt(index: number): SpecimenScheme {
  if (!Number.isInteger(index) || index < 0 || index >= SPECIMEN_SCHEMES.length)
    return SPECIMEN_SCHEMES[0];
  return SPECIMEN_SCHEMES[index];
}
