import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { create } from 'fontkit';
import generatedFonts from './fonts';
import { localFonts } from './localFonts';
import { localGeneratedFonts } from './localFonts.generated';

const CATEGORIES = ['sans', 'serif', 'display', 'script', 'mono'];
const SOURCES = ['bunny', 'fontsource', 'local'];

describe('generated fonts.ts catalog', () => {
  it('has a substantial catalog', () => {
    expect(generatedFonts.length).toBeGreaterThan(100);
  });

  it('every font has valid required fields', () => {
    for (const f of generatedFonts) {
      expect(f.family, 'family').toBeTruthy();
      expect(CATEGORIES, `category of ${f.family}`).toContain(f.category);
      expect(SOURCES, `source of ${f.family}`).toContain(f.source);
      expect(Array.isArray(f.variants)).toBe(true);
      expect(f.siteUrl).toMatch(/^https?:\/\//);
      expect(f.downloadUrl).toMatch(/^https?:\/\//);
    }
  });

  it('fontsource fonts carry an id and static jsDelivr faces', () => {
    const fs = generatedFonts.filter((f) => f.source === 'fontsource');
    expect(fs.length).toBeGreaterThan(0);
    for (const f of fs) {
      expect(f.id, `id of ${f.family}`).toBeTruthy();
      expect(f.faces?.length, `faces of ${f.family}`).toBeTruthy();
      for (const face of f.faces!) {
        expect(face.src).toMatch(
          /^https:\/\/cdn\.jsdelivr\.net\/fontsource\/fonts\/.+\.woff2$/
        );
      }
    }
  });

  it('bunny fonts load via the combined stylesheet (no inline faces)', () => {
    for (const f of generatedFonts.filter((f) => f.source === 'bunny')) {
      expect(f.faces, `${f.family} should not have faces`).toBeUndefined();
    }
  });

  it('has no duplicate families (case-insensitive)', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const f of generatedFonts) {
      const key = f.family.toLowerCase();
      if (seen.has(key)) dupes.push(f.family);
      seen.add(key);
    }
    expect(dupes).toEqual([]);
  });
});

describe('self-hosted font files are valid', () => {
  // We ship these files in the repo, so a corrupt, empty, or wrong file would
  // render as a silent system fallback. Parse each with fontkit (the engine
  // browser-grade tooling builds on) and confirm it has glyphs. We deliberately
  // do NOT compare the embedded name to the catalog `family`: that family is the
  // CSS name we choose, and a font's internal name often differs ("Space Grotesk
  // Light", "NimbusSanL"). The `src` path is the real binding.
  const faces = [...localGeneratedFonts, ...localFonts].flatMap((f) =>
    (f.faces ?? []).map((face) => face.src)
  );

  it.each(faces)('%s parses and has glyphs', (src) => {
    const file = join(process.cwd(), 'static', src); // src is root-relative: /fonts/X
    const font = create(readFileSync(file));
    // We ship single fonts, not collections (a collection has no numGlyphs).
    if (!('numGlyphs' in font))
      throw new Error(`${src} is a font collection, expected a single font`);
    expect(font.numGlyphs).toBeGreaterThan(0);
  });
});

describe('every font is licensed and credited', () => {
  // We redistribute (local) or hot-link (bunny/fontsource) these fonts, so each
  // must ship a license and a designer credit. Covers all three sources at once:
  // bunny/fontsource come from the generator (Google metadata / Fontsource npm
  // metadata.json, with DESIGNER_OVERRIDES as the escape hatch), local is
  // hand-typed in fonts.yaml. A blank field here means a step dropped attribution.
  const ALL = [...generatedFonts, ...localGeneratedFonts, ...localFonts];

  it('declares a non-empty license for every font', () => {
    const missing = ALL.filter((f) => !f.license?.trim()).map(
      (f) => `${f.family} (${f.source})`
    );
    expect(missing, 'fonts missing a license').toEqual([]);
  });

  it('declares a non-empty designer for every font', () => {
    const missing = ALL.filter((f) => !f.designer?.trim()).map(
      (f) => `${f.family} (${f.source})`
    );
    expect(missing, 'fonts missing a designer').toEqual([]);
  });
});

describe('localFonts.ts', () => {
  it('each local font is self-hosted with valid faces', () => {
    for (const f of localFonts) {
      expect(f.source).toBe('local');
      expect(f.faces?.length).toBeTruthy();
      for (const face of f.faces!) {
        expect(face.src.startsWith('/')).toBe(true);
      }
    }
  });
});

describe('localFonts.generated.ts (from fonts.yaml)', () => {
  // You redistribute these files, so attribution is mandatory. The generator
  // can't auto-fill it (there's no API for self-hosted fonts); it's hand-typed
  // in the YAML. This guards against shipping a self-hosted font with no credit.
  it('every self-hosted font declares a designer and a license', () => {
    for (const f of localGeneratedFonts) {
      expect(f.source).toBe('local');
      expect(f.designer, `designer of ${f.family}`).toBeTruthy();
      expect(f.license, `license of ${f.family}`).toBeTruthy();
    }
  });
});
