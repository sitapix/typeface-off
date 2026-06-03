<script lang="ts">
import type { PlacementTier } from './game';

// Shareable ranking card — the snapshot target for the JPEG export. A Swiss
// type-specimen sheet: one sharp near-black field grained like ink on paper,
// a masthead (the collection played), the champion set HUGE in its own family,
// and a runners-up index keyed by rank range, every name in its own letterform.
// The chrome (collection / rank / designer) is set in Poppins — a clean
// geometric sans that stays quiet under the specimens — with proportional
// (non-tabular) figures. Names keep an inline font-family so captureImage's
// preloader picks them up; the ground is opaque and corners sharp so the
// exported JPEG has no transparency or triangle artifacts. The drop shadow is
// on-screen lift only; it isn't baked into the JPEG.
let {
  tiers,
  categoryLabel = ''
}: { tiers: PlacementTier[]; categoryLabel?: string } = $props();

const champ = $derived(tiers[0]);
const rest = $derived(tiers.slice(1));
const championFamily = $derived(champ?.fonts[0]?.family ?? '');
const championDesigner = $derived(champ?.fonts[0]?.designer ?? '');
// A tier's finishing slot as an en-dash range when fonts tie (e.g. 5–8 for four
// quarter-finalists), so the card reads like a results index.
const rankRange = (tier: PlacementTier) => {
  const last = tier.place + tier.fonts.length - 1;
  return last > tier.place ? `${tier.place}–${last}` : String(tier.place);
};
</script>

<div
  class="results-card relative mx-auto flex w-full max-w-xl flex-col overflow-hidden p-8 text-left text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,0.45)]"
  style="background-color:#121316; font-family:'Poppins', system-ui, -apple-system, sans-serif;">
  <!-- film grain over the whole card: white specks pushed into a gamma-crushed
       alpha so the field stays deep near-black and only a fine tooth reads. Sits
       behind the type (which stays crisp). feTurbulence renders natively on the
       snapdom export too, since snapdom rasterises through the browser. -->
  <svg
    class="pointer-events-none absolute inset-0 h-full w-full opacity-[0.45]"
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

  <!-- masthead: the collection played -->
  {#if categoryLabel}
    <div class="relative z-10 text-sm text-white/55">{categoryLabel}</div>
  {/if}

  {#if champ}
    <!-- champion: the winner set huge in its own face; the title + designer
         index it on the line below -->
    <div
      class="champion relative z-10 mt-7 text-[4rem] leading-[0.9] tracking-[-0.03em] break-words text-balance text-white"
      style="font-family: '{championFamily}'">
      {championFamily}
    </div>
    <div
      class="relative z-10 mt-3 flex items-baseline justify-between gap-4 text-sm">
      <span class="text-white/70">Champion</span>
      {#if championDesigner}
        <span class="truncate text-white/40">{championDesigner}</span>
      {/if}
    </div>
  {/if}

  <!-- runners-up: a results index — rank range in the gutter, contending faces
       set in their own letterforms, tiers separated by space alone -->
  {#if rest.length}
    <ol class="relative z-10 mt-9 flex flex-col gap-7">
      {#each rest as tier (tier.place)}
        <li class="flex gap-5">
          <div class="w-10 shrink-0 pt-1 text-xs text-white/45">
            {rankRange(tier)}
          </div>
          <div class="flex min-w-0 flex-col gap-1.5">
            {#each tier.fonts as font (font.family)}
              <span
                class="text-2xl leading-tight tracking-tight break-words text-white"
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
