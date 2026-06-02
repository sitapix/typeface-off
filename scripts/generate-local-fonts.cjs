/**
 * Turns the `local:` section of scripts/fonts.yaml into
 * src/lib/localFonts.generated.ts.
 *
 *   node scripts/generate-local-fonts.cjs    (or: npm run fonts:local)
 *
 * Offline — reads the YAML config + checks files exist in static/fonts/.
 * See scripts/fonts.yaml for the schema.
 */
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const STATIC_DIR = 'static/fonts';
const YAML_FILE = 'scripts/fonts.yaml';
const OUT = 'src/lib/localFonts.generated.ts';
const CATEGORIES = ['sans', 'serif', 'display', 'script', 'mono'];

const WEIGHT_KEYWORDS = [
  [/thin|hairline/i, '100'],
  [/extra[-_ ]?light|ultra[-_ ]?light/i, '200'],
  [/light/i, '300'],
  [/regular|normal|book/i, '400'],
  [/medium/i, '500'],
  [/semi[-_ ]?bold|demi[-_ ]?bold/i, '600'],
  [/extra[-_ ]?bold|ultra[-_ ]?bold/i, '800'],
  [/black|heavy/i, '900'],
  [/bold/i, '700']
];

function inferWeight(name) {
  const numeric = name.match(/(?:^|[-_ ])([1-9]00)(?:[-_ .]|$)/);
  if (numeric) return numeric[1];
  for (const [re, w] of WEIGHT_KEYWORDS) if (re.test(name)) return w;
  return '400';
}
const inferItalic = (name) => /italic|oblique/i.test(name);

function variantLabel(face) {
  const w = !face.weight
    ? '400'
    : face.weight.includes(' ')
      ? 'variable'
      : face.weight;
  const b = w === '400' ? 'regular' : w;
  return face.style === 'italic' ? `${b}italic` : b;
}

let entries = [];
try {
  const cfg = YAML.parse(fs.readFileSync(YAML_FILE, 'utf8')) || {};
  entries = Array.isArray(cfg.local) ? cfg.local : [];
} catch (e) {
  console.error(`Could not parse ${YAML_FILE}: ${e.message}`);
  process.exit(1);
}

const report = { added: [], missing: [], bad: [] };
const fontsArr = [];

for (const entry of entries) {
  const family = (entry.family || '').trim();
  const category = (entry.category || '').toLowerCase().trim();
  if (!family || !CATEGORIES.includes(category)) {
    report.bad.push(
      `${family || JSON.stringify(entry)} (category "${entry.category}")`
    );
    continue;
  }

  // Build a normalized list of { file, weight?, style? }.
  let rawFaces = [];
  if (Array.isArray(entry.faces) && entry.faces.length) {
    rawFaces = entry.faces.map((f) => ({
      file: f.file,
      weight: f.weight != null ? String(f.weight) : undefined,
      style: f.style
    }));
  } else if (Array.isArray(entry.files) && entry.files.length) {
    rawFaces = entry.files.map((file) => ({
      file,
      weight: entry.variable
        ? '100 900'
        : inferWeight(file) === '400'
          ? undefined
          : inferWeight(file),
      style: inferItalic(file) ? 'italic' : undefined
    }));
  }

  const faces = [];
  let ok = rawFaces.length > 0;
  for (const rf of rawFaces) {
    if (!rf.file || !fs.existsSync(path.join(STATIC_DIR, rf.file))) {
      report.missing.push(`${family}: ${rf.file || '(no file)'}`);
      ok = false;
      continue;
    }
    const face = { src: `/fonts/${rf.file}` };
    if (rf.weight) face.weight = rf.weight;
    if (rf.style && rf.style !== 'normal') face.style = rf.style;
    faces.push(face);
  }
  if (!ok || !faces.length) continue;

  const variants = [...new Set(faces.map(variantLabel))];
  const url = entry.url || faces[0].src;
  fontsArr.push({
    family,
    category,
    source: 'local',
    faces,
    variants: variants.length ? variants : ['regular'],
    siteUrl: url,
    downloadUrl: url
  });
  report.added.push(family);
}

const out =
  `import type { Font } from './fonts';\n\n` +
  `// AUTO-GENERATED from the local: section of scripts/fonts.yaml by scripts/generate-local-fonts.cjs.\n` +
  `// Run: npm run fonts:local  — do not edit by hand (use localFonts.ts for manual entries).\n` +
  `export const localGeneratedFonts: Font[] = ${JSON.stringify(fontsArr, null, 2)};\n`;
fs.writeFileSync(OUT, out);

console.log(`Wrote ${OUT} — ${fontsArr.length} self-hosted font(s)`);
if (report.added.length) console.log(`Added: ${report.added.join(', ')}`);
if (report.missing.length)
  console.log(
    `Skipped, file not found in ${STATIC_DIR}: ${report.missing.join('; ')}`
  );
if (report.bad.length)
  console.log(`Skipped, invalid entry: ${report.bad.join('; ')}`);
