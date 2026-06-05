<script lang="ts">
import '../app.css';
import { base } from '$app/paths';
import { Toast } from '@skeletonlabs/skeleton-svelte';
import { Icon, fonts } from '$lib';
import { buildFontFaceCss } from '$lib/fontFaces';
import { toaster } from '$lib/toaster';

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
//
// Non-mono families request the duel's bold + italic cuts (`:400,700,400i,700i`)
// so the type-tester renders real <strong>/<em>/headings instead of faux. Each
// cut still lazy-loads via display=swap + unicode-range, so it's only fetched
// when actually shown — declaring it costs ~nothing. Bunny returns only the cuts
// a family actually has (single-weight display faces just yield 400). Mono stays
// weight-400 (the code editor uses neither bold nor italic).
const bunnyHref =
  'https://fonts.bunny.net/css?family=' +
  fonts
    .filter((f) => f.source === 'bunny')
    .map((f) => {
      const slug = f.family.replace(/\s+/g, '+');
      return f.category === 'mono' ? slug : `${slug}:400,700,400i,700i`;
    })
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
  <!-- Poppins powers the wordmark (Logo.svelte, 700/bold) and the share-card
       chrome (ResultsCard.svelte, 400 + 600). The combined sheet above loads
       only weight 400, so the heavier weights are requested explicitly to avoid
       faux-bold. Keep these weights in sync with those components. -->
  <link
    rel="stylesheet"
    href="https://fonts.bunny.net/css?family=Poppins:400,600,700&display=swap" />
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

<!-- App-wide toast outlet. Singleton group fed by the shared `toaster` store;
     `toast.type` (set by the success/error/info shorthands) picks the preset so
     the tone reads at a glance. -->
<Toast.Group toaster={toaster}>
  {#snippet children(toast)}
    {@const tone =
      toast.type === 'success'
        ? 'preset-filled-success-500'
        : toast.type === 'error'
          ? 'preset-filled-error-500'
          : toast.type === 'warning'
            ? 'preset-filled-warning-500'
            : 'preset-filled-surface-100-900'}
    <Toast
      toast={toast}
      class="card flex max-w-sm items-start gap-3 p-3 pr-2 shadow-xl {tone}">
      <Toast.Message class="flex-1">
        <Toast.Title class="font-semibold">{toast.title}</Toast.Title>
        {#if toast.description}
          <Toast.Description class="text-sm opacity-90"
            >{toast.description}</Toast.Description>
        {/if}
      </Toast.Message>
      <Toast.CloseTrigger
        class="btn-icon btn-icon-sm shrink-0 opacity-70 hover:opacity-100"
        aria-label="Dismiss notification">
        <Icon name="x" size={16} />
      </Toast.CloseTrigger>
    </Toast>
  {/snippet}
</Toast.Group>
