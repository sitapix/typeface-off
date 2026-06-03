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
const {
  CATEGORIES,
  FONTS_YAML,
  loadFontsConfig
} = require('./fonts-shared.cjs');

const STATIC_DIR = 'static/fonts';
const LICENSES_DIR = path.join(STATIC_DIR, 'licenses');
const OUT = 'src/lib/localFonts.generated.ts';

// Convention: each self-hosted font ships its license text in static/fonts/licenses/
// named <Family-with-spaces-removed>-<ID>.txt (e.g. "Hanken Round" -> HankenRound-OFL.txt).
// Match on the family, not the filename: the file can be named differently
// (e.g. family "Fixel" ships as FixelText-Regular.woff2).
const licenseTextFiles = fs.existsSync(LICENSES_DIR)
  ? fs.readdirSync(LICENSES_DIR)
  : [];
function hasLicenseText(family) {
  const key = family.replace(/\s+/g, '').toLowerCase();
  return licenseTextFiles.some((lf) => lf.toLowerCase().startsWith(key));
}

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
  const cfg = loadFontsConfig();
  entries = Array.isArray(cfg.local) ? cfg.local : [];
} catch (e) {
  console.error(`Could not read/parse ${FONTS_YAML}: ${e.message}`);
  process.exit(1);
}

const report = {
  added: [],
  missing: [],
  bad: [],
  noDesigner: [],
  noLicense: [],
  noLicenseText: []
};
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
    designer: entry.designer || undefined,
    license: entry.license || undefined,
    variants: variants.length ? variants : ['regular'],
    siteUrl: url,
    downloadUrl: url
  });
  report.added.push(family);

  // Attribution is hand-typed in the YAML (no API to fall back on for local
  // fonts), and the license text is a separate file you have to remember to ship.
  // Surface each omission so it can't pass silently.
  if (!entry.designer) report.noDesigner.push(family);
  if (!entry.license) report.noLicense.push(family);
  if (!hasLicenseText(family)) report.noLicenseText.push(family);
}

const out =
  `import type { Font } from './fonts';\n\n` +
  `// AUTO-GENERATED from the local: section of scripts/fonts.yaml by scripts/generate-local-fonts.cjs.\n` +
  `// Run: npm run fonts:local  — do not edit by hand (use localFonts.ts for manual entries).\n` +
  `export const localGeneratedFonts: Font[] = ${JSON.stringify(fontsArr, null, 2)};\n`;
fs.writeFileSync(OUT, out);

// Orphan scan: font files in static/fonts/ that no local: entry references.
// They still ship in the build (dead weight) but are wired to nothing.
const FONT_EXT = /\.(woff2?|ttf|otf)$/i;
const referenced = new Set(
  fontsArr.flatMap((f) => f.faces.map((fc) => path.basename(fc.src)))
);
const orphans = fs
  .readdirSync(STATIC_DIR)
  .filter((f) => FONT_EXT.test(f) && !referenced.has(f));

console.log(`Wrote ${OUT} — ${fontsArr.length} self-hosted font(s)`);
if (report.added.length) console.log(`Added: ${report.added.join(', ')}`);
if (report.missing.length)
  console.log(
    `Skipped, file not found in ${STATIC_DIR}: ${report.missing.join('; ')}`
  );
if (report.bad.length)
  console.log(`Skipped, invalid entry: ${report.bad.join('; ')}`);

// Loud, non-fatal warnings for the easy-to-miss steps. The font still ships;
// these make a skipped step hard to miss.
const warn = (label, list) =>
  list.length && console.warn(`⚠ ${label}: ${list.join(', ')}`);
warn('Missing `designer:` in fonts.yaml', report.noDesigner);
warn('Missing `license:` in fonts.yaml', report.noLicense);
warn(
  `Missing license text in ${LICENSES_DIR}/ (you redistribute these files, so ship the license .txt)`,
  report.noLicenseText
);
if (orphans.length)
  console.warn(
    `⚠ Unreferenced font files in ${STATIC_DIR}/ (no local: entry uses them; delete or wire up): ${orphans.join(', ')}`
  );
