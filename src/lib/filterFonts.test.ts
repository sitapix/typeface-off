import { describe, it, expect } from 'vitest';
import { filterFonts } from './filterFonts';
import type { Font } from './fonts';

const f = (family: string, category: Font['category']): Font => ({
  family,
  category,
  source: 'bunny',
  variants: ['regular'],
  siteUrl: '#',
  downloadUrl: '#'
});

const sample: Font[] = [
  f('Inter', 'sans'),
  f('Roboto Mono', 'mono'),
  f('Playfair Display', 'serif'),
  f('Lobster', 'display'),
  f('Caveat', 'script')
];

describe('filterFonts', () => {
  it('returns everything when no options are given', () => {
    expect(filterFonts(sample)).toHaveLength(5);
  });

  it("treats category 'all' as no category filter", () => {
    expect(filterFonts(sample, { category: 'all' })).toHaveLength(5);
  });

  it('filters by a single category', () => {
    expect(filterFonts(sample, { category: 'mono' }).map((x) => x.family)).toEqual([
      'Roboto Mono'
    ]);
  });

  it('matches the term as a case-insensitive substring of the family', () => {
    expect(filterFonts(sample, { term: 'pLaY' }).map((x) => x.family)).toEqual([
      'Playfair Display'
    ]);
  });

  it('trims surrounding whitespace from the term', () => {
    expect(filterFonts(sample, { term: '  inter  ' }).map((x) => x.family)).toEqual([
      'Inter'
    ]);
  });

  it('combines term AND category', () => {
    expect(
      filterFonts(sample, { term: 'o', category: 'mono' }).map((x) => x.family)
    ).toEqual(['Roboto Mono']);
    expect(filterFonts(sample, { term: 'inter', category: 'mono' })).toHaveLength(0);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterFonts(sample, { term: 'zzzzz' })).toHaveLength(0);
  });
});
