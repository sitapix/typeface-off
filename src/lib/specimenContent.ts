import type { FontCategory } from './fonts';

/**
 * Content for the Game's type-specimen (SpecimenPreview): a term as the hero word
 * over its Wikipedia lead, with the shared charset rows beneath.
 *
 * `html` is the verbatim lead from the action API (action=parse&section=0),
 * cleaned by scripts/fetch-specimen-leads.py: links/bold/italics kept (links are
 * inert <a class="lnk">, no href), footnotes and edit links dropped, wording not
 * paraphrased. Topics are type/lettering lore, kept glyph-safe (extracts with
 * rare glyphs like ‽ ☞ ℔ are skipped; Tittle's accented-glyph tail is trimmed).
 *
 * Keyed by category so a single-category bracket shows both fonts the same
 * passage across all matchups; `seed` rotates the entry between replays.
 * Browse/detail use NotePreview; mono uses CodePreview.
 */
export interface Specimen {
  /** The term — the Wikipedia article title, set big as the glance target. */
  word: string;
  /** Cleaned rich-HTML lead from Wikipedia (rendered via {@html}). */
  html: string;
  /** Source article slug — en.wikipedia.org/wiki/<source>, for provenance. */
  source: string;
}

/**
 * The charset rows, identical for every specimen — the "fair completeness"
 * guarantee (every face shows the same full alphabet + figures + punctuation).
 */
export const CHARSET = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  figures: '0123456789 (!@#$%&.,?:;)'
} as const;

/** ≥2 entries per non-mono category, so replays of a category rotate. */
const SPECIMENS: Record<Exclude<FontCategory, 'mono'>, Specimen[]> = {
  sans: [
    {
      word: 'Typeface',
      source: 'Typeface',
      html: `<p>A <strong>typeface</strong> (or <strong>font family</strong>) is a design of <a class="lnk">letters</a>, <a class="lnk">numbers</a> and other <a class="lnk">symbols</a>, to be used in <a class="lnk">printing</a> or for electronic display. Most typefaces include variations in <a class="lnk">size</a> (e.g., 24 point), weight (e.g., light, bold), slope (e.g., italic), width (e.g., condensed), and so on. Each of these variations of the typeface is a <a class="lnk">font</a>.</p>`
    },
    {
      word: 'Kerning',
      source: 'Kerning',
      html: `<p>In <a class="lnk">typography</a>, <strong>kerning</strong> is the process of adjusting the space between two specific <a class="lnk">characters</a>, or <a class="lnk">letterforms</a>, in a <a class="lnk">font</a>. It is not to be confused with <a class="lnk"><em>tracking</em></a>, by which spacing is adjusted uniformly over a <em>range</em> of characters.</p>`
    }
  ],
  serif: [
    {
      word: 'Roman type',
      source: 'Roman_type',
      html: `<p>In <a class="lnk">Latin script</a> <a class="lnk">typography</a>, <strong>roman</strong> is one of the three main kinds of <a class="lnk">historical type</a>, alongside <a class="lnk">blackletter</a> and <a class="lnk">italic</a>. Sometimes called <strong>normal</strong> or <strong>regular</strong>, it is distinct from these two for its upright style (relative to the calligraphy-inspired italic) and its simplicity (relative to blackletter).</p>`
    },
    {
      word: 'Pilcrow',
      source: 'Pilcrow',
      html: `<p>In <a class="lnk">typography</a>, the <strong>pilcrow</strong> (<strong>¶</strong>) is a <a class="lnk">grapheme</a> used to identify a <a class="lnk">paragraph</a>. In editorial production the <em>pilcrow</em> typographic character is also known as the <strong>paragraph mark</strong>, the <strong>paragraph sign</strong>, the <strong>paragraph symbol</strong>, the <strong>paraph</strong>, and the <strong>blind P</strong>.</p>`
    }
  ],
  display: [
    {
      word: 'Blackletter',
      source: 'Blackletter',
      html: `<p><strong>Blackletter</strong> (also <strong>black letter</strong> or sometimes <strong>black-letter</strong>; sometimes popularly known as <strong>Gothic minuscule</strong> or <strong>Gothic type</strong>) was originally a medieval <a class="lnk">book hand</a> (<strong>Textualis</strong> or <strong>Textura</strong>) of the <a class="lnk">Gothic family of scripts</a>, later adapted into <a class="lnk">typefaces</a> and still used in modern <a class="lnk">calligraphy</a> and <a class="lnk">typesetting</a>.</p>`
    },
    {
      word: 'Ampersand',
      source: 'Ampersand',
      html: `<p>The <strong>ampersand</strong>, also known as the <strong>and sign</strong>, is the <a class="lnk">logogram</a> <strong>&</strong>, representing the <a class="lnk">conjunction</a> "and". It originated as a <a class="lnk">ligature</a> of the word <em>et</em> (<a class="lnk">Latin</a> for 'and').</p>`
    }
  ],
  script: [
    {
      word: 'Swash',
      source: 'Swash_(typography)',
      html: `<p>A <strong>swash</strong> is a <a class="lnk">typographical</a> flourish, such as an exaggerated <a class="lnk">serif</a>, terminal, tail, entry stroke, etc., on a <a class="lnk">glyph</a>. The use of swash characters dates back to at least the 16th century, as they can be seen in <a class="lnk">Ludovico Vicentino degli Arrighi</a>'s <em>La Operina,</em> which is dated 1522. As with <a class="lnk">italic type</a> in general, they were inspired by the conventions of period handwriting.</p>`
    },
    {
      word: 'Tittle',
      source: 'Tittle',
      html: `<p>The <strong>tittle</strong> or <strong>superscript dot</strong> is the dot on top of <a class="lnk">lowercase</a> <em>i</em> and <em>j</em>. In English writing the tittle is a diacritic which appears only as part of these glyphs, but <a class="lnk">diacritic dots</a> can appear over other letters in various languages.</p>`
    }
  ]
};

/**
 * The specimen for a category at `seed` (rotates by `seed % pool.length`).
 * Falls back to the sans pool for any unexpected category (e.g. 'mono', which
 * never renders this) so the component always has content.
 */
export function specimenFor(category: FontCategory, seed = 0): Specimen {
  const pool =
    SPECIMENS[category as Exclude<FontCategory, 'mono'>] ?? SPECIMENS.sans;
  const i = Number.isInteger(seed) && seed >= 0 ? seed % pool.length : 0;
  return pool[i];
}
