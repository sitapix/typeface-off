<script lang="ts">
import '../app.css';
import { fonts } from '$lib';

let { children } = $props();

// Build the Google Fonts stylesheet URL from the font list so fonts.ts is the
// single source of truth — add a font there and it loads automatically.
const fontHref =
  'https://fonts.googleapis.com/css2?' +
  fonts.map((f) => 'family=' + f.family.replace(/\s+/g, '+')).join('&') +
  '&display=swap';
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link rel="stylesheet" href={fontHref} />
</svelte:head>

{@render children()}

<canvas
  id="canvas"
  class="pointer-events-none fixed inset-0 z-[100] h-full w-full"></canvas>
