import type { Font } from './fonts';

/** Map a font file URL/path to a CSS `format()` value. */
export function faceFormat(src: string): string {
  if (src.endsWith('.woff2')) return 'woff2';
  if (src.endsWith('.woff')) return 'woff';
  if (src.endsWith('.otf')) return 'opentype';
  return 'truetype';
}

/**
 * Build one inline `<style>`-ready string of `@font-face` rules for every font
 * that carries `faces` (Fontsource static files + self-hosted local fonts).
 * Pure — used by the root layout and unit tested.
 */
export function buildFontFaceCss(fonts: Font[]): string {
  return fonts
    .filter((f) => f.faces && f.faces.length)
    .flatMap((f) =>
      f.faces!.map(
        (face) =>
          `@font-face{font-family:'${f.family}';src:url('${face.src}') format('${faceFormat(face.src)}');font-weight:${face.weight ?? '400'};font-style:${face.style ?? 'normal'};font-display:swap;}`
      )
    )
    .join('');
}
