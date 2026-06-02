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

module.exports = { CATEGORIES, FONTS_YAML, bunnyId, loadFontsConfig };
