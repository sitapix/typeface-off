import { describe, it, expect } from 'vitest';
import { faceFormat, buildFontFaceCss } from './fontFaces';
import type { Font } from './fonts';

const base = (over: Partial<Font>): Font => ({
  family: 'X',
  category: 'sans',
  source: 'local',
  variants: ['regular'],
  siteUrl: '#',
  downloadUrl: '#',
  ...over
});

describe('faceFormat', () => {
  it('detects the CSS format from the file extension', () => {
    expect(faceFormat('/fonts/x.woff2')).toBe('woff2');
    expect(faceFormat('/fonts/x.woff')).toBe('woff');
    expect(faceFormat('/fonts/x.otf')).toBe('opentype');
    expect(faceFormat('/fonts/x.ttf')).toBe('truetype');
  });
});

describe('buildFontFaceCss', () => {
  it('ignores fonts without faces (e.g. bunny)', () => {
    expect(buildFontFaceCss([base({ source: 'bunny', faces: undefined })])).toBe('');
  });

  it('emits an @font-face with sensible defaults', () => {
    const css = buildFontFaceCss([
      base({ family: 'My Font', faces: [{ src: '/fonts/m.woff2' }] })
    ]);
    expect(css).toContain("font-family:'My Font'");
    expect(css).toContain("url('/fonts/m.woff2') format('woff2')");
    expect(css).toContain('font-weight:400');
    expect(css).toContain('font-style:normal');
    expect(css).toContain('font-display:swap');
  });

  it('honors provided weight and style (e.g. variable range / italic)', () => {
    const css = buildFontFaceCss([
      base({ faces: [{ src: '/x.woff2', weight: '100 900', style: 'italic' }] })
    ]);
    expect(css).toContain('font-weight:100 900');
    expect(css).toContain('font-style:italic');
  });

  it('emits one rule per face', () => {
    const css = buildFontFaceCss([
      base({ faces: [{ src: '/a.woff2' }, { src: '/b.woff2' }] })
    ]);
    expect(css.match(/@font-face/g)).toHaveLength(2);
  });
});
