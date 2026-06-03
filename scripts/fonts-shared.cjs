/**
 * Shared helpers for the font generators (generate-fonts.cjs + generate-local-fonts.cjs).
 * Keeps the category list, the Bunny slug rule, and the YAML config loader in
 * ONE place so the two generators can't drift apart.
 */
const fs = require('fs');
const YAML = require('yaml');

// The five internal font categories, in catalog order.
// Mirrors FontCategory in src/lib/fonts.ts.
const CATEGORIES = ['sans', 'serif', 'display', 'script', 'mono'];

// The hand-edited font config: `google:` extras + `local:` self-hosted fonts.
const FONTS_YAML = 'scripts/fonts.yaml';

// Bunny Fonts family slug, e.g. 'Fira Code' -> 'fira-code'.
const bunnyId = (family) => family.toLowerCase().replace(/\s+/g, '-');

// Parse scripts/fonts.yaml. Returns {} for an empty file; throws if the file is
// missing or malformed (each caller decides whether that is fatal).
function loadFontsConfig() {
  return YAML.parse(fs.readFileSync(FONTS_YAML, 'utf8')) || {};
}

// Google's category string → our internal category.
const ANATOMICAL_CATEGORY = {
  'Sans Serif': 'sans',
  Serif: 'serif',
  Display: 'display',
  Handwriting: 'script',
  Monospace: 'mono'
};

// A "headline cut": Display-tagged and single-weight. Italics of that weight
// aren't a separate weight, so drop the `…i` keys before counting.
function isGoogleHeadlineCut(meta) {
  if (!(meta.classifications || []).includes('Display')) return false;
  const weights = Object.keys(meta.fonts || {}).filter((k) => !/i$/.test(k));
  return weights.length === 1;
}

// Which bucket a Google family lands in (null if unsupported). Single-weight
// Display-tagged sans/serif move to `display` so headline cuts don't crowd the
// text brackets; multi-weight Display families stay. Why: docs/how-the-google-fonts-get-in.md.
function googleBucket(meta) {
  const anatomical = ANATOMICAL_CATEGORY[meta.category] || null;
  if (
    (anatomical === 'sans' || anatomical === 'serif') &&
    isGoogleHeadlineCut(meta)
  )
    return 'display';
  return anatomical;
}

module.exports = {
  CATEGORIES,
  FONTS_YAML,
  bunnyId,
  loadFontsConfig,
  googleBucket,
  isGoogleHeadlineCut
};
