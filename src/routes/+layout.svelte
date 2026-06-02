<script lang="ts">
import '../app.css';
import { fonts } from '$lib';

let { children } = $props();

// Each source loads its own way; fonts.ts is the single source of truth.
// Google → one combined css2 stylesheet. Fontsource → one jsDelivr stylesheet
// per font. Add a font in fonts.ts and it loads automatically.
const googleHref =
  'https://fonts.googleapis.com/css2?' +
  fonts
    .filter((f) => f.source === 'google')
    .map((f) => 'family=' + f.family.replace(/\s+/g, '+'))
    .join('&') +
  '&display=swap';

const fontsourceHrefs = fonts
  .filter((f) => f.source === 'fontsource' && f.id)
  .map((f) => `https://cdn.jsdelivr.net/fontsource/css/${f.id}@latest/index.css`);
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin="anonymous" />
  <link rel="stylesheet" href={googleHref} />
  {#each fontsourceHrefs as href (href)}
    <link rel="stylesheet" href={href} />
  {/each}
</svelte:head>

{@render children()}

<canvas
  id="canvas"
  class="pointer-events-none fixed inset-0 z-[100] h-full w-full"></canvas>
