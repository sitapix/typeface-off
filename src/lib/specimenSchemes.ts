/**
 * Bold type-specimen colour schemes for the non-mono preview (the NotePreview
 * specimen shown in the Game and on Browse / detail). Each is a fixed
 * foreground/background pair that recolours the specimen the way a foundry
 * presents a face — reversed, on colour, on paper — so you judge how the
 * letterforms hold up against real grounds, not just the app surface.
 *
 * Theme-independent: the app's 12 Skeleton themes recolour the chrome, these
 * recolour only the specimen. Mono fonts use CodePreview and ignore these.
 * Every pair clears WCAG AA for normal text (the tightest, #0070ff on black,
 * is ~4.7:1). Order is intentional — the swatch picker renders it as-is.
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
}

export const SPECIMEN_SCHEMES: readonly SpecimenScheme[] = [
  { id: 'ink', label: 'Black on white', fg: '#000000', bg: '#ffffff' },
  { id: 'reverse', label: 'White on black', fg: '#ffffff', bg: '#000000' },
  { id: 'azure', label: 'Blue on black', fg: '#0070ff', bg: '#000000' },
  { id: 'lime', label: 'Black on lime', fg: '#000000', bg: '#8ace00' },
  {
    id: 'vermilion',
    label: 'Black on vermilion',
    fg: '#000000',
    bg: '#fe531d'
  },
  { id: 'indigo', label: 'White on indigo', fg: '#ffffff', bg: '#593eff' },
  { id: 'klein', label: 'Blue on off-white', fg: '#1c26fd', bg: '#f3f1ea' },
  { id: 'acid', label: 'Yellow on black', fg: '#ebf80d', bg: '#000000' },
  { id: 'sun', label: 'Black on yellow', fg: '#000000', bg: '#ffeb01' }
] as const;

/** The scheme at `index`, clamped into range (defaults to the first). */
export function schemeAt(index: number): SpecimenScheme {
  if (!Number.isInteger(index) || index < 0 || index >= SPECIMEN_SCHEMES.length)
    return SPECIMEN_SCHEMES[0];
  return SPECIMEN_SCHEMES[index];
}
