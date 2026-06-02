<script lang="ts">
import type { PlacementTier } from './game';

// Shareable ranking card — the snapshot target for the JPEG export. A
// type-specimen poster: one sharp near-black field grained like ink on paper,
// the champion set HUGE in white at the top with its rank, the runners-up below
// as a results index keyed by rank range, every name set in its own family. The
// chrome (rank / category / designer) is set in Geist Sans — a sleek sans
// that stays quiet under the specimens — with proportional (non-tabular) figures
// and no rules between tiers; spacing alone separates them. Names keep an inline
// font-family so captureImage's preloader picks them up; the ground is opaque and
// corners sharp so the exported JPEG has no transparency or triangle artifacts.
// The drop shadow is on-screen lift only; it isn't baked into the JPEG.
let {
  tiers,
  categoryLabel = ''
}: { tiers: PlacementTier[]; categoryLabel?: string } = $props();

const champ = $derived(tiers[0]);
const rest = $derived(tiers.slice(1));
const championFamily = $derived(champ?.fonts[0]?.family ?? '');
const rank = (place: number) => String(place);
// A tier's finishing slot as a range when fonts tie (e.g. 5-8 for four
// quarter-finalists), so the card reads like a results index.
const rankRange = (tier: PlacementTier) => {
  const last = tier.place + tier.fonts.length - 1;
  return last > tier.place
    ? `${rank(tier.place)}-${rank(last)}`
    : rank(tier.place);
};
</script>

<div
  class="results-card relative mx-auto flex w-full max-w-xl flex-col gap-8 overflow-hidden p-8 text-left text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,0.45)]"
  style="background-color:#121316; font-family:'Geist Sans', system-ui, -apple-system, sans-serif;">
  <!-- film grain over the whole card: white specks pushed into a gamma-crushed
       alpha so the field stays deep near-black and only a fine tooth reads. Sits
       behind the type (which stays crisp). feTurbulence renders natively on the
       snapdom export too, since snapdom rasterises through the browser. -->
  <svg
    class="pointer-events-none absolute inset-0 h-full w-full opacity-[0.55]"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg">
    <filter id="card-grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.7"
        numOctaves="2"
        stitchTiles="stitch"
        result="noise" />
      <feColorMatrix
        in="noise"
        type="matrix"
        values="0 0 0 0 1
                0 0 0 0 1
                0 0 0 0 1
                0.33 0.33 0.33 0 0" />
      <feComponentTransfer>
        <feFuncA type="gamma" amplitude="1" exponent="4" offset="0" />
      </feComponentTransfer>
    </filter>
    <rect width="100%" height="100%" filter="url(#card-grain)" />
  </svg>

  {#if champ}
    <!-- champion: a Pantone-style swatch label — collection + rank code, then the
         winner set huge, tight to the top -->
    <div class="relative z-10 flex flex-col gap-1">
      {#if categoryLabel}
        <div class="mb-2 text-sm text-white/45">{categoryLabel}</div>
      {/if}
      <div class="text-xs text-white/55">{rank(champ.place)}</div>
      <div
        class="text-[3.75rem] leading-[0.9] tracking-tight text-balance text-white"
        style="font-family: '{championFamily}'">
        {championFamily}
      </div>
      {#if champ.fonts[0]?.designer}
        <div class="text-[13px] text-white/50">{champ.fonts[0].designer}</div>
      {/if}
    </div>
  {/if}

  <!-- runners-up: a results index, names set in their own faces, no rules -->
  {#if rest.length}
    <ol class="relative z-10 flex flex-col gap-7">
      {#each rest as tier (tier.place)}
        <li class="flex flex-col gap-2.5">
          <div class="text-xs text-white/45">{rankRange(tier)}</div>
          <div class="flex flex-col gap-1">
            {#each tier.fonts as font (font.family)}
              <span
                class="truncate text-2xl leading-tight tracking-tight text-white"
                style="font-family: '{font.family}'">
                {font.family}
              </span>
            {/each}
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</div>
