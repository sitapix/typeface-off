<script lang="ts">
import '../app.css';
import { base } from '$app/paths';
import { fonts } from '$lib';
import { buildFontFaceCss } from '$lib/fontFaces';

let { children } = $props();

// Loading strategy (fonts.ts is the single source of truth):
//  • Bunny  → ONE combined stylesheet (covers the popular families, uses
//             unicode-range so each woff2 is fetched lazily).
//  • Fontsource & local → inline @font-face pointing at static files (jsDelivr
//             for Fontsource via its `faces`, /static for local). This means
//             ZERO extra stylesheet requests, and the browser lazy-loads each
//             woff2 only when that font is actually rendered. Scales to any
//             number of fonts without slowing first paint.
// Bunny's v1 /css endpoint takes ONE pipe-separated family list
// (?family=A|B|C) — NOT repeated &family= params (that's the /css2 syntax, which
// /css silently ignores past the first family, leaving every font but the first
// unstyled). Pipe-join is the fix.
const bunnyHref =
  'https://fonts.bunny.net/css?family=' +
  fonts
    .filter((f) => f.source === 'bunny')
    .map((f) => f.family.replace(/\s+/g, '+'))
    .join('|') +
  '&display=swap';

const faceCss = buildFontFaceCss(fonts, base);
</script>

<svelte:head>
  <link
    rel="preconnect"
    href="https://fonts.bunny.net"
    crossorigin="anonymous" />
  <link
    rel="preconnect"
    href="https://cdn.jsdelivr.net"
    crossorigin="anonymous" />
  <link rel="stylesheet" href={bunnyHref} />
  {#if faceCss}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html `<style>${faceCss}</style>`}
  {/if}
</svelte:head>

{@render children()}

<canvas
  id="canvas"
  aria-hidden="true"
  class="pointer-events-none fixed inset-0 z-[100] h-full w-full"></canvas>
