import { describe, it, expect } from 'vitest';
import generatedFonts from './fonts';
import { localFonts } from './localFonts';

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
