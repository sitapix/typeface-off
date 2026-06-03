<script lang="ts">
import { tick } from 'svelte';
import type { PlacementTier } from './game';

// Shareable ranking card — the snapshot target for the square JPEG export.
// A pitch-black type-specimen photo: the champion set HUGE in its own family,
// the runners-up listed below each in its own letterform, and a single caption
// pinned bottom-right (the collection played). Everything is plain white on pure
// black; a fine film grain is the only texture. Names keep an inline font-family
// so captureImage's preloader picks them up; the ground is opaque and corners
// sharp so the exported JPEG has no transparency or triangle artifacts.
//
// Sizing is in container-query units (cqw) against the wrapper's `@container`,
// so the whole card scales with its width: identical proportions on a phone and
// in the pinned-490px export, nothing clipped. The drop shadow is on-screen lift
// only; it isn't baked into the JPEG.
let {
  tiers,
  categoryLabel = '',
  onmeasured
}: {
  tiers: PlacementTier[];
  categoryLabel?: string;
  // Fired once the per-font x-height sizes have been measured and applied to
  // the DOM, so a capture of this card reflects the final layout.
  onmeasured?: () => void;
} = $props();

const champ = $derived(tiers[0]);
const championFamily = $derived(champ?.fonts[0]?.family ?? '');
// Runners-up flattened to a single ranked list — no rank gutter, no tier gaps,
// just the names in their own faces (the placement tiers still order them).
const runnersUp = $derived(tiers.slice(1).flatMap((tier) => tier.fonts));

// --- metric-aware sizing --------------------------------------------------
// Each runner-up is scaled so its x-height lands at one constant value, read
// from the font's own metrics. x-height (not cap-height) is what makes a list
// of mixed faces read as one even size: the lowercase bulk carries the
// perceived weight, so matching it settles the rhythm and stops wide, condensed
// or all-caps faces from looming larger than the rest. CSS `font-size-adjust`
// expresses the same idea but is applied inconsistently across engines and the
// snapdom export, so we measure with a canvas and set an explicit font-size.
const REF_WIDTH = 490; // px the card is designed + exported at (see captureImage)
const BASE_CQW = (28 / REF_WIDTH) * 100; // nominal 28px runner size, as cqw
const TARGET_X = 0.52; // x-height as a fraction of em every runner is matched to

// family -> measured x-height ratio (x-height / em); filled in on the client.
let xRatios = $state<Record<string, number>>({});
let measureCanvas: HTMLCanvasElement | undefined;

$effect(() => {
  const families = runnersUp.map((f) => f.family);
  if (typeof document === 'undefined' || families.length === 0) return;
  let cancelled = false;
  (async () => {
    await Promise.all(
      families.map((f) =>
        document.fonts.load(`400 100px '${f}'`).catch(() => {})
      )
    );
    if (cancelled) return;
    const ctx = (measureCanvas ??= document.createElement('canvas')).getContext(
      '2d'
    );
    if (!ctx) return;
    const next: Record<string, number> = {};
    for (const f of families) {
      ctx.font = `400 100px '${f}', sans-serif`;
      const x = ctx.measureText('x').actualBoundingBoxAscent;
      next[f] = x > 0 ? x / 100 : TARGET_X;
    }
    xRatios = next;
    await tick(); // let the new per-font sizes land in the DOM before capture
    if (!cancelled) onmeasured?.();
  })();
  return () => {
    cancelled = true;
  };
});

// font-size (cqw, so it tracks the card width) that puts this family's x-height
// at TARGET_X. Clamped so a freak metric can't blow the line out of the box.
function runnerSize(family: string): string {
  const r = xRatios[family];
  const scale = r ? Math.min(1.3, Math.max(0.8, TARGET_X / r)) : 1;
  return `${(BASE_CQW * scale).toFixed(3)}cqw`;
}
</script>

<div
  class="results-card relative mx-auto flex aspect-square w-full flex-col overflow-hidden p-[8.16cqw] text-left text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,0.45)]"
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
      class="champion relative z-10 text-[13.06cqw] leading-[0.9] tracking-[-0.03em] break-words text-balance text-white"
      style="font-family: '{championFamily}'">
      {championFamily}
    </div>
  {/if}

  {#if runnersUp.length}
    <!-- runners-up: a plain white list, each name in its own letterform, scaled
         to one x-height (runnerSize) so the column reads even. line-height is a
         constant cqw, set on the list so every row inherits the same rhythm
         regardless of its font-size. -->
    <ol class="relative z-10 mt-[6.53cqw] flex flex-col leading-[8.16cqw]">
      {#each runnersUp as font (font.family)}
        <li
          class="tracking-tight break-words text-[#ffffffd1]"
          style="font-family: '{font.family}'; font-size: {runnerSize(
            font.family
          )};">
          {font.family}
        </li>
      {/each}
    </ol>
  {/if}

  <!-- caption: the collection played, plain white, bottom-right -->
  {#if categoryLabel}
    <div
      class="absolute right-[8.16cqw] bottom-[8.16cqw] z-10 text-[3.27cqw] text-[#ffffffd1]">
      {categoryLabel}
    </div>
  {/if}
</div>
