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

// --- fit-to-box -----------------------------------------------------------
// A long champion name or a full runner list can overrun the fixed square and
// clip under overflow-hidden. After sizing, measure the content and scale it
// down just enough to fit. The ratio is width-independent (everything is cqw),
// so the value measured on screen also fits the pinned-490px export.
let cardEl = $state<HTMLDivElement>();
let fitInner = $state<HTMLDivElement>();
let fit = $state(1);
const PAD_FRAC = 0.0816; // matches p-[8.16cqw]
const CAPTION_RESERVE_FRAC = 0.05; // keep content clear of the pinned caption
const MIN_FIT = 0.5; // never shrink past half size; clip is better than illegible

function measureFit() {
  if (!cardEl || !fitInner) return;
  const w = cardEl.clientWidth;
  const reserve = 2 * PAD_FRAC + (categoryLabel ? CAPTION_RESERVE_FRAC : 0);
  const available = cardEl.clientHeight - reserve * w;
  const natural = fitInner.scrollHeight; // layout height; the scale doesn't change it
  fit =
    natural > available && available > 0
      ? Math.max(MIN_FIT, available / natural)
      : 1;
}

$effect(() => {
  const families = runnersUp.map((f) => f.family);
  const all = championFamily ? [championFamily, ...families] : families;
  if (typeof document === 'undefined' || all.length === 0) return;
  let cancelled = false;
  (async () => {
    await Promise.all(
      all.map((f) => document.fonts.load(`400 100px '${f}'`).catch(() => {}))
    );
    if (cancelled) return;
    const ctx = (measureCanvas ??= document.createElement('canvas')).getContext(
      '2d'
    );
    if (ctx) {
      const next: Record<string, number> = {};
      for (const f of families) {
        ctx.font = `400 100px '${f}', sans-serif`;
        const x = ctx.measureText('x').actualBoundingBoxAscent;
        next[f] = x > 0 ? x / 100 : TARGET_X;
      }
      xRatios = next;
    }
    await tick(); // per-font sizes are in the DOM…
    if (cancelled) return;
    measureFit(); // …now they have a height to fit
    await tick(); // …and the scale is applied before capture
    if (!cancelled) onmeasured?.();
  })();
  return () => {
    cancelled = true;
  };
});

// Re-fit when the card resizes (responsive width) or a late font reflows the
// content. The scale doesn't alter layout height, so this can't loop.
$effect(() => {
  if (typeof ResizeObserver === 'undefined' || !cardEl || !fitInner) return;
  const ro = new ResizeObserver(() => measureFit());
  ro.observe(cardEl);
  ro.observe(fitInner);
  return () => ro.disconnect();
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
  bind:this={cardEl}
  class="results-card relative mx-auto flex aspect-square w-full flex-col overflow-hidden p-[8.16cqw] text-left text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,0.45)]"
  style="background-color:#000000; font-family:'Poppins', system-ui, -apple-system, sans-serif; font-synthesis: none;">
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

  <!-- Everything but the grain and the pinned caption scales together via
       `fit`, so a long champion name or a full runner list never overruns the
       square (see measureFit). -->
  <div
    bind:this={fitInner}
    class="relative z-10 origin-top-left"
    style="transform: scale({fit});">
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
  </div>

  <!-- caption: the collection played, plain white, bottom-right -->
  {#if categoryLabel}
    <div
      class="absolute right-[8.16cqw] bottom-[8.16cqw] z-10 text-[3.27cqw] text-[#ffffffd1]">
      {categoryLabel}
    </div>
  {/if}
</div>
