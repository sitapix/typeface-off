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

// How many of each category to take from Google (by popularity).
const GTAKE = { sans: 44, serif: 32, display: 32, script: 24, mono: 24 };
// Cap per category for Fontsource non-Google fonts (null = no cap).
const FSTAKE = { sans: null, serif: null, display: null, script: null, mono: null };

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
// Skip non-text / brand / CJK fonts that would bloat or break the stylesheet.
function excluded(family) {
  if (/^Google Sans/.test(family)) return true;
  if (/\b(JP|KR|TC|SC|HK)$/.test(family)) return true;
  if (/(Emoji|Icons?|Symbols?)/i.test(family)) return true;
  return false;
}

function gVariants(f) {
  const keys = Object.keys(f.fonts || { '400': {} });
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
  const gfRaw = (await (await fetch('https://fonts.google.com/metadata/fonts')).text()).replace(
    /^\)\]\}'?\s*/,
    ''
  );
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
      seeds.push({ family: f.family, category: b, source: 'bunny', variants: gVariants(f) });
      seen.add(f.family.toLowerCase());
      bunnyAdded++;
    }
  }

  // ---- Fontsource non-Google fonts (live) ----
  const fsList = await (await fetch('https://api.fontsource.org/v1/fonts?type=other')).json();
  const fsCount = { sans: 0, serif: 0, display: 0, script: 0, mono: 0 };
  let fsAdded = 0;
  for (const f of fsList) {
    const b = fsBucket(f.category);
    if (!b || excluded(f.family) || seen.has(f.family.toLowerCase())) continue;
    if (FSTAKE[b] != null && fsCount[b] >= FSTAKE[b]) continue;
    const variants = [];
    for (const w of f.weights || [400]) variants.push(w === 400 ? 'regular' : String(w));
    if ((f.styles || []).includes('italic')) variants.push('italic');
    seeds.push({
      family: f.family,
      category: b,
      source: 'fontsource',
      id: f.id,
      variants: variants.length ? variants : ['regular']
    });
    seen.add(f.family.toLowerCase());
    fsCount[b]++;
    fsAdded++;
  }

  // ---- emit src/lib/fonts.ts ----
  const seedLines = seeds
    .map((s) => {
      const idPart = s.source === 'fontsource' ? `, id: ${JSON.stringify(s.id)}` : '';
      return `  { family: ${JSON.stringify(s.family)}, category: '${s.category}', source: '${s.source}'${idPart}, variants: ${JSON.stringify(s.variants)} }`;
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
})();
