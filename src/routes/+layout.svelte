<script lang="ts">
import '../app.css';
import { fonts } from '$lib';

let { children } = $props();

// Each source loads its own way; fonts.ts is the single source of truth.
// Bunny Fonts (privacy-friendly Google Fonts mirror) → one combined stylesheet.
// Fontsource → one jsDelivr stylesheet per font. Add a font in fonts.ts and it
// loads automatically.
const bunnyHref =
  'https://fonts.bunny.net/css?' +
  fonts
    .filter((f) => f.source === 'bunny')
    .map((f) => 'family=' + f.family.replace(/\s+/g, '+'))
    .join('&') +
  '&display=swap';

const fontsourceHrefs = fonts
  .filter((f) => f.source === 'fontsource' && f.id)
  .map((f) => `https://cdn.jsdelivr.net/fontsource/css/${f.id}@latest/index.css`);

// Self-hosted (local) fonts: generate @font-face rules from their `faces`.
function faceFormat(src: string): string {
  if (src.endsWith('.woff2')) return 'woff2';
  if (src.endsWith('.woff')) return 'woff';
  if (src.endsWith('.otf')) return 'opentype';
  return 'truetype';
}
const localFaceCss = fonts
  .filter((f) => f.source === 'local' && f.faces)
  .flatMap((f) =>
    f.faces!.map(
      (face) =>
        `@font-face{font-family:'${f.family}';src:url('${face.src}') format('${faceFormat(face.src)}');font-weight:${face.weight ?? '400'};font-style:${face.style ?? 'normal'};font-display:swap;}`
    )
  )
  .join('');
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.bunny.net" crossorigin="anonymous" />
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin="anonymous" />
  <link rel="stylesheet" href={bunnyHref} />
  {#each fontsourceHrefs as href (href)}
    <link rel="stylesheet" href={href} />
  {/each}
  {#if localFaceCss}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html `<style>${localFaceCss}</style>`}
  {/if}
</svelte:head>

{@render children()}

<canvas
  id="canvas"
  class="pointer-events-none fixed inset-0 z-[100] h-full w-full"></canvas>
