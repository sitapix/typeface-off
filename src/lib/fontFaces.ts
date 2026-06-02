import type { Font } from './fonts';

/** Map a font file URL/path to a CSS `format()` value. */
export function faceFormat(src: string): string {
  if (src.endsWith('.woff2')) return 'woff2';
  if (src.endsWith('.woff')) return 'woff';
  if (src.endsWith('.otf')) return 'opentype';
  return 'truetype';
}

/**
 * Prefix a root-relative app path (e.g. `/fonts/x.woff2`) with the SvelteKit
 * `base` so it resolves under a subpath (GitHub Pages project site). Absolute
 * URLs (`https://…`, protocol-relative) are returned untouched. Used for both
 * `@font-face` sources and self-hosted Visit/Download link hrefs.
 */
export function withBase(path: string, base = ''): string {
  return path.startsWith('/') ? `${base}${path}` : path;
}

/**
 * Build one inline `<style>`-ready string of `@font-face` rules for every font
 * that carries `faces` (Fontsource static files + self-hosted local fonts).
 * `base` is SvelteKit's configured base path. Pure — used by the root layout
 * and unit tested.
 */
export function buildFontFaceCss(fonts: Font[], base = ''): string {
  return fonts
    .filter((f) => f.faces && f.faces.length)
    .flatMap((f) =>
      f.faces!.map((face) => {
        const src = withBase(face.src, base);
        return `@font-face{font-family:'${f.family}';src:url('${src}') format('${faceFormat(face.src)}');font-weight:${face.weight ?? '400'};font-style:${face.style ?? 'normal'};font-display:swap;}`;
      })
    )
    .join('');
}
