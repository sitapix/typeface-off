import { describe, it, expect } from 'vitest';
import {
  QUICK_SIZE,
  popularFonts,
  selfHostedFonts,
  curatedExtras,
  quickRoster,
  fullRoster
} from './roster';
import type { Font, FontSource } from './fonts';

const f = (
  family: string,
  category: Font['category'],
  source: FontSource = 'bunny'
): Font => ({
  family,
  category,
  source,
  variants: ['regular'],
  siteUrl: '#',
  downloadUrl: '#'
});

// Two bunny (Google, popularity order) + one fontsource + one local, plus a
// font in another category to prove category scoping.
const sample: Font[] = [
  f('Inter', 'sans'),
  f('Roboto', 'sans'),
  f('Metropolis', 'sans', 'fontsource'),
  f('Karrik', 'sans', 'local'),
  f('JetBrains Mono', 'mono')
];

describe('popularFonts', () => {
  it('returns only bunny fonts of the category, in array (popularity) order', () => {
    expect(popularFonts(sample, 'sans').map((x) => x.family)).toEqual([
      'Inter',
      'Roboto'
    ]);
  });

  it('excludes fontsource and local fonts', () => {
    const fams = popularFonts(sample, 'sans').map((x) => x.family);
    expect(fams).not.toContain('Metropolis');
    expect(fams).not.toContain('Karrik');
  });

  it('scopes to the requested category', () => {
    expect(popularFonts(sample, 'mono').map((x) => x.family)).toEqual([
      'JetBrains Mono'
    ]);
  });
});

describe('selfHostedFonts', () => {
  it('returns only local fonts of the category', () => {
    expect(selfHostedFonts(sample, 'sans').map((x) => x.family)).toEqual([
      'Karrik'
    ]);
  });

  it('excludes bunny and fontsource fonts', () => {
    const fams = selfHostedFonts(sample, 'sans').map((x) => x.family);
    expect(fams).not.toContain('Inter');
    expect(fams).not.toContain('Metropolis');
  });
});

describe('curatedExtras', () => {
  it('resolves names to catalog fonts, preserving order', () => {
    expect(
      curatedExtras(sample, 'sans', ['Metropolis']).map((x) => x.family)
    ).toEqual(['Metropolis']);
  });

  it('drops names already in Full via populars or self-hosting (no duplicates)', () => {
    // Inter is popular, Karrik is self-hosted; both reach Full another way.
    expect(
      curatedExtras(sample, 'sans', ['Inter', 'Karrik', 'Metropolis']).map(
        (x) => x.family
      )
    ).toEqual(['Metropolis']);
  });

  it('skips names absent from the catalog', () => {
    expect(curatedExtras(sample, 'sans', ['Nope', 'Metropolis'])).toHaveLength(
      1
    );
  });

  it('returns an empty array when no names are given', () => {
    expect(curatedExtras(sample, 'sans')).toEqual([]);
  });
});

describe('quickRoster', () => {
  it('takes the top-`size` popular fonts', () => {
    expect(quickRoster(sample, 'sans', 1).map((x) => x.family)).toEqual([
      'Inter'
    ]);
  });

  it('never includes extras (populars only)', () => {
    const fams = quickRoster(sample, 'sans').map((x) => x.family);
    expect(fams).toEqual(['Inter', 'Roboto']);
  });

  it('defaults to QUICK_SIZE', () => {
    const many: Font[] = Array.from({ length: QUICK_SIZE + 5 }, (_, i) =>
      f(`Sans ${i}`, 'sans')
    );
    expect(quickRoster(many, 'sans')).toHaveLength(QUICK_SIZE);
  });
});

describe('fullRoster', () => {
  it('is populars, then self-hosted, then the curated extras', () => {
    expect(
      fullRoster(sample, 'sans', ['Metropolis']).map((x) => x.family)
    ).toEqual(['Inter', 'Roboto', 'Karrik', 'Metropolis']);
  });

  it('auto-includes a self-hosted font without listing it in names', () => {
    const fams = fullRoster(sample, 'sans').map((x) => x.family);
    expect(fams).toEqual(['Inter', 'Roboto', 'Karrik']);
  });

  it('does not duplicate a font reachable another way', () => {
    // Inter (popular) and Karrik (self-hosted) listed redundantly in names.
    const fams = fullRoster(sample, 'sans', ['Inter', 'Karrik', 'Metropolis']);
    expect(fams.map((x) => x.family)).toEqual([
      'Inter',
      'Roboto',
      'Karrik',
      'Metropolis'
    ]);
    expect(fams.filter((x) => x.family === 'Karrik')).toHaveLength(1);
  });
});
