<script lang="ts">
import type { PlacementTier } from './game';

// Shareable ranking card — the snapshot target for the square JPEG export.
// A pitch-black type-specimen photo: the champion set HUGE in its own family,
// the runners-up listed below each in its own letterform, and a single caption
// pinned bottom-right (the collection played). Everything is plain white
// (#ffffff) on pure black; a fine film grain is the only texture. Names keep an
// inline font-family so captureImage's preloader picks them up; the ground is
// opaque and corners sharp so the exported JPEG has no transparency or triangle
// artifacts. The card is forced square (aspect-square + pinned export height)
// so every saved image is 1:1. The drop shadow is on-screen lift only; it
// isn't baked into the JPEG.
let {
  tiers,
  categoryLabel = ''
}: { tiers: PlacementTier[]; categoryLabel?: string } = $props();

const champ = $derived(tiers[0]);
const championFamily = $derived(champ?.fonts[0]?.family ?? '');
// Runners-up flattened to a single ranked list — no rank gutter, no tier gaps,
// just the names in their own faces (the placement tiers still order them).
const runnersUp = $derived(tiers.slice(1).flatMap((tier) => tier.fonts));
</script>

<div
  class="results-card relative mx-auto flex aspect-square w-full max-w-xl flex-col overflow-hidden p-10 text-left text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,0.45)]"
  style="background-color:#000000; font-family:'Poppins', system-ui, -apple-system, sans-serif;">
  <!-- film grain: specular-lit fractal noise — a soft periwinkle sheen where
       the turbulence peaks, transparent elsewhere (feSpecularLighting's alpha is
       max(r,g,b)), so a fine premium tooth reads over the pitch-black ground.
       seed is pinned so every saved image is identical; feSpecularLighting
       rasterises natively through snapdom on export. -->
  <svg
    class="pointer-events-none absolute inset-0 h-full w-full opacity-[0.5]"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg">
    <filter id="card-grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.694"
        numOctaves="5"
        seed="5"
        stitchTiles="stitch"
        result="noise" />
      <feSpecularLighting
        in="noise"
        lighting-color="#b0afff"
        surfaceScale="5.4"
        specularConstant="0.1"
        specularExponent="50"
        result="lit">
        <feDistantLight azimuth="116" elevation="57" />
      </feSpecularLighting>
    </filter>
    <rect width="100%" height="100%" filter="url(#card-grain)" />
  </svg>

  {#if champ}
    <!-- champion: the winner set huge in its own face -->
    <div
      class="champion relative z-10 text-[4rem] leading-[0.9] tracking-[-0.03em] break-words text-balance text-white"
      style="font-family: '{championFamily}'">
      {championFamily}
    </div>
  {/if}

  {#if runnersUp.length}
    <!-- runners-up: a plain white list, each name in its own letterform.
         font-size-adjust normalises every font to the same cap-height (from its
         own metrics), so the capitals land at one visual size and the vertical
         rhythm reads even despite the faces differing. -->
    <ol
      class="relative z-10 mt-8 flex flex-col"
      style="font-size-adjust: cap-height 0.7;">
      {#each runnersUp as font (font.family)}
        <li
          class="text-[1.75rem] leading-tight tracking-tight break-words text-[#ffffffd1]"
          style="font-family: '{font.family}'">
          {font.family}
        </li>
      {/each}
    </ol>
  {/if}

  <!-- caption: the collection played, plain white, bottom-right -->
  {#if categoryLabel}
    <div class="absolute right-10 bottom-10 z-10 text-base text-[#ffffffd1]">
      {categoryLabel}
    </div>
  {/if}
</div>
