/**
 * Regenerates src/lib/fonts.ts — the curated Bunny + Fontsource font catalog.
 *
 *   node scripts/generate-fonts.cjs       (or: npm run fonts:generate)
 *
 * It pulls the most popular families per category from the Google Fonts metadata
 * (served via Bunny Fonts) and merges in Fontsource's non-Google OSS fonts.
 * It does NOT touch src/lib/localFonts.ts (your self-hosted fonts are safe).
 *
 * Tune the counts in GTAKE / FSTAKE below. Requires Node 18+ (global fetch).
 */
const fs = require('fs');
const YAML = require('yaml');

// How many of each category to take from Google (by popularity).
const GTAKE = { sans: 44, serif: 32, display: 32, script: 24, mono: 24 };
// Cap per category for Fontsource non-Google fonts (null = no cap).
const FSTAKE = {
  sans: null,
  serif: null,
  display: null,
  script: null,
  mono: null
};

function gBucket(cat) {
  if (cat === 'Sans Serif') return 'sans';
  if (cat === 'Serif') return 'serif';
  if (cat === 'Display') return 'display';
  if (cat === 'Handwriting') return 'script';
  if (cat === 'Monospace') return 'mono';
  return null;
}
function fsBucket(cat) {
  if (cat === 'sans-serif') return 'sans';
  if (cat === 'serif') return 'serif';
  if (cat === 'display') return 'display';
  if (cat === 'handwriting') return 'script';
  if (cat === 'monospace') return 'mono';
  return null;
}

// Build one @font-face `src` (static jsDelivr woff2) for a Fontsource font, so we
// can inline @font-face instead of fetching a stylesheet per font. Variable fonts
// use the :vf weight-axis file (covers all weights); static fonts use the 400
// file (or the nearest available weight).
function fsFaces(f) {
  const sub = f.defSubset || 'latin';
  const ws = f.weights && f.weights.length ? f.weights : [400];
  // Most fonts have 'normal'; some (e.g. Syne Italic) are italic-only.
  const style = (f.styles || ['normal']).includes('normal')
    ? 'normal'
    : 'italic';
  let face;
  if (f.variable) {
    const min = Math.min(...ws);
    const max = Math.max(...ws);
    face = {
      src: `https://cdn.jsdelivr.net/fontsource/fonts/${f.id}:vf@latest/${sub}-wght-${style}.woff2`,
      weight: min === max ? String(min) : `${min} ${max}`
    };
  } else {
    const w = ws.includes(400) ? 400 : ws[0];
    face = {
      src: `https://cdn.jsdelivr.net/fontsource/fonts/${f.id}@latest/${sub}-${w}-${style}.woff2`,
      weight: String(w)
    };
  }
  if (style === 'italic') face.style = 'italic';
  return [face];
}
// Skip non-text / brand / CJK fonts that would bloat or break the stylesheet.
function excluded(family) {
  if (/^Google Sans/.test(family)) return true;
  if (/\b(JP|KR|TC|SC|HK)$/.test(family)) return true;
  if (/(Emoji|Icons?|Symbols?)/i.test(family)) return true;
  return false;
}

function gVariants(f) {
  const keys = Object.keys(f.fonts || { 400: {} });
  const out = [];
  for (const k of keys) {
    let label;
    if (k === '400') label = 'regular';
    else if (k === '400i') label = 'italic';
    else if (/^\d+$/.test(k)) label = k;
    else if (/^(\d+)i$/.test(k)) label = k.replace(/i$/, '') + 'italic';
    else label = k;
    if (!out.includes(label)) out.push(label);
  }
  return out.length ? out : ['regular'];
}

(async () => {
  // ---- Google Fonts metadata (live) ----
  const gfRaw = (
    await (await fetch('https://fonts.google.com/metadata/fonts')).text()
  ).replace(/^\)\]\}'?\s*/, '');
  const gfList = JSON.parse(gfRaw).familyMetadataList || [];

  const gBuckets = { sans: [], serif: [], display: [], script: [], mono: [] };
  for (const f of gfList) {
    const b = gBucket(f.category);
    if (b && !excluded(f.family)) gBuckets[b].push(f);
  }
  for (const b of Object.keys(gBuckets))
    gBuckets[b].sort((a, z) => (a.popularity || 1e9) - (z.popularity || 1e9));

  const seeds = [];
  const seen = new Set();
  let bunnyAdded = 0;
  for (const b of ['sans', 'serif', 'display', 'script', 'mono']) {
    for (const f of gBuckets[b].slice(0, GTAKE[b])) {
      seeds.push({
        family: f.family,
        category: b,
        source: 'bunny',
        variants: gVariants(f)
      });
      seen.add(f.family.toLowerCase());
      bunnyAdded++;
    }
  }

  // ---- Extra hand-picked Google fonts (google: in scripts/fonts.yaml) ----
  // One family name per line; '#' comments and blank lines ignored. These are
  // added regardless of popularity. Each is looked up in the Google metadata
  // (for category + weights) and verified to exist on Bunny so it can't break
  // the combined stylesheet. Duplicates/unknowns are reported and skipped.
  const report = { added: [], duplicate: [], notFound: [], notOnBunny: [] };
  let extraNames = [];
  try {
    const cfg = YAML.parse(fs.readFileSync('scripts/fonts.yaml', 'utf8')) || {};
    extraNames = Array.isArray(cfg.google)
      ? cfg.google.map((s) => String(s).trim()).filter(Boolean)
      : [];
  } catch {
    /* no fonts.yaml — fine */
  }
  if (extraNames.length) {
    const gfByName = new Map(gfList.map((f) => [f.family.toLowerCase(), f]));
    const bunnySet = new Set(
      Object.keys(await (await fetch('https://fonts.bunny.net/list')).json())
    );
    const toBunnyId = (fam) => fam.toLowerCase().replace(/\s+/g, '-');
    const fileSeen = new Set();
    for (const name of extraNames) {
      const key = name.toLowerCase();
      if (fileSeen.has(key)) {
        report.duplicate.push(`${name} (listed twice)`);
        continue;
      }
      fileSeen.add(key);
      const meta = gfByName.get(key);
      if (!meta) {
        report.notFound.push(name);
        continue;
      }
      if (seen.has(meta.family.toLowerCase())) {
        report.duplicate.push(`${meta.family} (already in catalog)`);
        continue;
      }
      if (!bunnySet.has(toBunnyId(meta.family))) {
        report.notOnBunny.push(meta.family);
        continue;
      }
      const cat = gBucket(meta.category);
      if (!cat) {
        report.notFound.push(`${name} (unsupported category ${meta.category})`);
        continue;
      }
      seeds.push({
        family: meta.family,
        category: cat,
        source: 'bunny',
        variants: gVariants(meta)
      });
      seen.add(meta.family.toLowerCase());
      bunnyAdded++;
      report.added.push(meta.family);
    }
  }

  // ---- Fontsource non-Google fonts (live) ----
  const fsList = await (
    await fetch('https://api.fontsource.org/v1/fonts?type=other')
  ).json();
  const fsCount = { sans: 0, serif: 0, display: 0, script: 0, mono: 0 };
  let fsAdded = 0;
  for (const f of fsList) {
    const b = fsBucket(f.category);
    if (!b || excluded(f.family) || seen.has(f.family.toLowerCase())) continue;
    if (FSTAKE[b] != null && fsCount[b] >= FSTAKE[b]) continue;
    const variants = [];
    for (const w of f.weights || [400])
      variants.push(w === 400 ? 'regular' : String(w));
    if ((f.styles || []).includes('italic')) variants.push('italic');
    seeds.push({
      family: f.family,
      category: b,
      source: 'fontsource',
      id: f.id,
      faces: fsFaces(f),
      variants: variants.length ? variants : ['regular']
    });
    seen.add(f.family.toLowerCase());
    fsCount[b]++;
    fsAdded++;
  }

  // ---- emit src/lib/fonts.ts ----
  const seedLines = seeds
    .map((s) => {
      const idPart =
        s.source === 'fontsource' ? `, id: ${JSON.stringify(s.id)}` : '';
      const facesPart = s.faces ? `, faces: ${JSON.stringify(s.faces)}` : '';
      return `  { family: ${JSON.stringify(s.family)}, category: '${s.category}', source: '${s.source}'${idPart}${facesPart}, variants: ${JSON.stringify(s.variants)} }`;
    })
    .join(',\n');

  const ts = `export type FontCategory = 'sans' | 'serif' | 'display' | 'script' | 'mono';
export type FontSource = 'bunny' | 'fontsource' | 'local';

/** One self-hosted @font-face (for source === 'local'). */
export interface FontFace {
  src: string; // path under /static, e.g. '/fonts/MyFont-Regular.woff2'
  weight?: string; // default '400'
  style?: string; // default 'normal'
}

export interface Font {
  family: string;
  category: FontCategory;
  source: FontSource;
  /** Fontsource slug — present when source === 'fontsource'. */
  id?: string;
  /** @font-face definitions — present when source === 'local'. */
  faces?: FontFace[];
  variants: string[];
  siteUrl: string;
  downloadUrl: string;
}

interface FontSeed {
  family: string;
  category: FontCategory;
  source: FontSource;
  id?: string;
  faces?: FontFace[];
  variants: string[];
}

// AUTO-GENERATED by scripts/generate-fonts.cjs — do not edit by hand.
// Self-hosted fonts go in src/lib/localFonts.ts (not touched by the generator).
const seeds: FontSeed[] = [
${seedLines}
];

function bunnyId(family: string): string {
  return family.toLowerCase().replace(/\\s+/g, '-');
}

function siteUrl(s: FontSeed): string {
  return s.source === 'bunny'
    ? \`https://fonts.bunny.net/family/\${bunnyId(s.family)}\`
    : \`https://fontsource.org/fonts/\${s.id}\`;
}

function downloadUrl(s: FontSeed): string {
  return s.source === 'bunny'
    ? \`https://fonts.bunny.net/family/\${bunnyId(s.family)}\`
    : \`https://fontsource.org/fonts/\${s.id}\`;
}

const fonts: Font[] = seeds.map((seed) => ({
  ...seed,
  siteUrl: siteUrl(seed),
  downloadUrl: downloadUrl(seed)
}));

export default fonts;
`;

  fs.writeFileSync('src/lib/fonts.ts', ts);
  const byCat = (c) => seeds.filter((s) => s.category === c).length;
  console.log(
    `Wrote src/lib/fonts.ts — ${seeds.length} fonts (bunny=${bunnyAdded}, fontsource=${fsAdded})\n` +
      `  sans=${byCat('sans')} serif=${byCat('serif')} display=${byCat('display')} script=${byCat('script')} mono=${byCat('mono')}`
  );

  // Report on the google: extras from scripts/fonts.yaml.
  if (report.added.length)
    console.log(
      `Extra fonts added (${report.added.length}): ${report.added.join(', ')}`
    );
  if (report.duplicate.length)
    console.log(
      `Skipped, duplicate (${report.duplicate.length}): ${report.duplicate.join(', ')}`
    );
  if (report.notFound.length)
    console.log(
      `Skipped, NOT FOUND on Google Fonts — check spelling (${report.notFound.length}): ${report.notFound.join(', ')}`
    );
  if (report.notOnBunny.length)
    console.log(
      `Skipped, not available on Bunny (${report.notOnBunny.length}): ${report.notOnBunny.join(', ')}`
    );
})();
