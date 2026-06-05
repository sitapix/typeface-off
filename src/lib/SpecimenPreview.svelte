<script lang="ts">
// Type-specimen for the Game duel (read-only). Either your own copy — the shared
// `previewText` (SSOT), rendered across styles in this font — or, until you've
// written any, the curated term-as-hero-word over its Wikipedia lead (from
// specimenContent.ts) with the shared charset rows. Editing happens in the
// in-place SpecimenEditor that replaces the duel in edit mode, not here.
// `compact` is the stacked mobile duel: each font gets half the screen, so it
// caps the height and drops the charset rows. Mono uses CodePreview.
import type { FontCategory } from '$lib/fonts';
import {
  specimenScheme,
  previewText,
  isCustomPreview
} from '$lib/store.svelte';
import { schemeAt } from '$lib/specimenSchemes';
import { specimenFor, CHARSET } from '$lib/specimenContent';

let {
  fontFamily = 'Inter',
  fontSize = 20,
  category = 'sans',
  seed = 0,
  compact = false,
  class: className = ''
}: {
  fontFamily?: string;
  fontSize?: number;
  category?: FontCategory;
  /** Per-bracket counter; rotates which entry shows (same for both duel fonts). */
  seed?: number;
  /** Stacked mobile duel: clamp the extract and centre so a short half-panel fits. */
  compact?: boolean;
  class?: string;
} = $props();

const scheme = $derived(schemeAt(specimenScheme.value));
const specimen = $derived(specimenFor(category, seed));

// Once you've written your own copy it becomes the shared SSOT shown in every
// specimen for the rest of the game; until then, the curated specimen shows.
const hasCustom = $derived(isCustomPreview(previewText.value));

// Category-appropriate fallback so the pre-load flash isn't jarring.
const fallback = $derived(
  category === 'serif'
    ? 'serif'
    : category === 'script'
      ? 'cursive'
      : 'sans-serif'
);

// Compact (mobile duel half) lets the lead fill the available height and clips
// what doesn't fit — so it adapts to the half's real height and the font's width
// instead of a fixed line cap that left dead space (or cut a wide font short).
// Desktop shows the whole passage and scrolls.
const extractStyle = $derived(
  `font-size: ${fontSize * (compact ? 1.0 : 1.05)}px; line-height: 1.45;`
);
</script>

<div
  class="specimen-preview flex h-full w-full flex-col overflow-hidden rounded-lg shadow-lg {className}"
  style="--ground:{scheme.bg}; --ink:{scheme.fg}; --link:{scheme.link};">
  {#if hasCustom}
    <!-- your own copy (the SSOT), rendered across styles (heading/body/bold/
         italic) in this font — the same content on both duel halves. -->
    <div
      class="specimen-body flex-1 px-6 py-5 {compact
        ? 'flex min-h-0 flex-col overflow-hidden'
        : 'overflow-auto'}"
      style="font-family: '{fontFamily}', {fallback}; font-size: {fontSize}px;">
      <div
        class="specimen-custom text-pretty {compact
          ? 'min-h-0 flex-1 overflow-hidden'
          : ''}"
        class:compact={compact}
        style="line-height: 1.4;">
        {@html previewText.value}
      </div>

      {#if !compact}
        <hr class="specimen-rule my-5" />

        <!-- charset: identical for every face (the fair-completeness guarantee) -->
        <div
          class="specimen-charset"
          style="font-size: {fontSize * 0.95}px; line-height: 1.5;">
          <div class="charset-row">{CHARSET.lower}</div>
          <div class="charset-row">{CHARSET.upper}</div>
          <div
            class="charset-row opacity-70"
            style="font-size: {fontSize * 0.9}px;">
            {CHARSET.figures}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div
      class="specimen-body flex-1 px-6 py-5 {compact
        ? 'flex min-h-0 flex-col overflow-hidden'
        : 'overflow-auto'}"
      style="font-family: '{fontFamily}', {fallback}; font-size: {fontSize}px;">
      <!-- term as hero word → verbatim Wikipedia lead (rich HTML) -->
      <div
        class="specimen-word font-bold text-balance shrink-0"
        style="font-size: {fontSize *
          (compact ? 2.2 : 2.6)}px; line-height: 1.04;">
        {specimen.word}
      </div>
      <div
        class="specimen-extract mt-3 text-pretty {compact
          ? 'min-h-0 flex-1 overflow-hidden'
          : ''}"
        style={extractStyle}>
        {@html specimen.html}
      </div>

      {#if !compact}
        <hr class="specimen-rule my-5" />

        <!-- charset: identical for every face (the fair-completeness guarantee) -->
        <div
          class="specimen-charset"
          style="font-size: {fontSize * 0.95}px; line-height: 1.5;">
          <div class="charset-row">{CHARSET.lower}</div>
          <div class="charset-row">{CHARSET.upper}</div>
          <div
            class="charset-row opacity-70"
            style="font-size: {fontSize * 0.9}px;">
            {CHARSET.figures}
          </div>
        </div>
      {/if}
    </div>

    <!-- Per-item Wikipedia credit (CC BY-SA). Neutral UI font; bottom-left, clear
       of the duel chip and Choose button. -->
    <div class="specimen-source">Wikipedia · {specimen.word}</div>
  {/if}
</div>

<style>
/* Scheme colours (--ground/--ink/--link) set inline; border/divider mix from
   the ink so they read on any ground. */
.specimen-preview {
  position: relative;
  background: var(--ground);
  color: var(--ink);
  border: 1px solid color-mix(in srgb, var(--ink) 16%, transparent);
}
/* The hero word renders at display size with `font-bold`, but most catalog fonts
   load only their regular weight — so the browser fakes the bold and it looks
   smeared/pixelated. Turn synthesis off: a real bold face is used when loaded,
   otherwise the word shows the crisp regular weight. */
.specimen-word {
  font-synthesis: none;
}
.specimen-extract {
  opacity: 0.9;
}
.specimen-source {
  flex: 0 0 auto;
  padding: 0 1.5rem 0.75rem;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.01em;
  color: var(--ink);
  opacity: 0.6;
}
/* Injected lead HTML ({@html}), so inner tags need :global. Links use the
   per-scheme --link colour, no underline; inert (no href). */
:global(.specimen-extract p) {
  margin: 0;
}
:global(.specimen-extract p + p) {
  margin-top: 0.6em;
}
:global(.specimen-extract .lnk) {
  color: var(--link);
  text-decoration: none;
}
:global(.specimen-extract strong) {
  font-weight: 700;
}
:global(.specimen-extract em) {
  font-style: italic;
}
/* Rendered custom copy ({@html} — Tiptap HTML from the SSOT). Headings echo the
   curated hero scale so a face is still judged at display + body sizes; real bold
   is used when the cut is loaded, otherwise a crisp regular (no smeared faux). */
.specimen-custom :global(h1) {
  font-weight: 700;
  font-size: 2.4em;
  line-height: 1.06;
}
.specimen-custom :global(h2) {
  font-weight: 700;
  font-size: 1.5em;
  line-height: 1.15;
  margin-top: 0.4em;
}
.specimen-custom.compact :global(h1) {
  font-size: 2em;
}
.specimen-custom :global(p) {
  margin: 0;
}
.specimen-custom :global(h1 + p),
.specimen-custom :global(h2 + p),
.specimen-custom :global(p + p) {
  margin-top: 0.5em;
}
.specimen-custom :global(strong) {
  font-weight: 700;
}
.specimen-custom :global(em) {
  font-style: italic;
}
.specimen-rule {
  border: 0;
  border-top: 1px solid color-mix(in srgb, var(--ink) 16%, transparent);
}
/* One row per charset line; clip rather than wrap the alphabet. */
.charset-row {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
}
</style>
