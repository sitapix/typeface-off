import { describe, it, expect } from 'vitest';
import {
  QUICK_SIZE,
  popularFonts,
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

describe('curatedExtras', () => {
  it('resolves names to non-popular catalog fonts, preserving order', () => {
    expect(
      curatedExtras(sample, 'sans', ['Karrik', 'Metropolis']).map(
        (x) => x.family
      )
    ).toEqual(['Karrik', 'Metropolis']);
  });

  it('drops names that are already popular Google fonts (no duplicates)', () => {
    expect(
      curatedExtras(sample, 'sans', ['Inter', 'Metropolis']).map(
        (x) => x.family
      )
    ).toEqual(['Metropolis']);
  });

  it('skips names absent from the catalog', () => {
    expect(curatedExtras(sample, 'sans', ['Nope', 'Karrik'])).toHaveLength(1);
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
  it('is every popular font followed by the curated extras', () => {
    expect(
      fullRoster(sample, 'sans', ['Metropolis', 'Karrik']).map((x) => x.family)
    ).toEqual(['Inter', 'Roboto', 'Metropolis', 'Karrik']);
  });

  it('does not duplicate a popular font listed in the extras', () => {
    const fams = fullRoster(sample, 'sans', ['Inter', 'Metropolis']).map(
      (x) => x.family
    );
    expect(fams).toEqual(['Inter', 'Roboto', 'Metropolis']);
    expect(fams.filter((x) => x === 'Inter')).toHaveLength(1);
  });
});
