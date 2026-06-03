<script lang="ts">
// Type-specimen for the Game duel: the term as a hero word over its Wikipedia
// lead (from specimenContent.ts), then the shared charset rows, on the active
// specimen scheme. Display-only so the whole duel half is one tap target.
// `compact` is the stacked mobile duel: each font gets half the screen, so it
// caps the extract height and drops the charset rows (the specimen can't scroll).
// Mono uses CodePreview; Browse/detail use NotePreview.
import type { FontCategory } from '$lib/fonts';
import { specimenScheme } from '$lib/store.svelte';
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

// Category-appropriate fallback so the pre-load flash isn't jarring.
const fallback = $derived(
  category === 'serif'
    ? 'serif'
    : category === 'script'
      ? 'cursive'
      : 'sans-serif'
);

// Compact caps the passage (~7 lines) so a long lead can't overflow the
// unscrollable half-panel; desktop shows it whole.
const extractStyle = $derived(
  `font-size: ${fontSize * (compact ? 1.0 : 1.05)}px; line-height: 1.45;` +
    (compact
      ? ` max-height: ${Math.round(fontSize * 1.45 * 7)}px; overflow: hidden;`
      : '')
);
</script>

<div
  class="specimen-preview flex h-full w-full flex-col overflow-hidden rounded-lg shadow-lg {className}"
  style="--ground:{scheme.bg}; --ink:{scheme.fg}; --link:{scheme.link};">
  <div
    class="specimen-body flex-1 px-6 py-5 {compact ? '' : 'overflow-auto'}"
    style="font-family: '{fontFamily}', {fallback}; font-size: {fontSize}px;">
    <!-- term as hero word → verbatim Wikipedia lead (rich HTML) -->
    <div
      class="specimen-word font-bold"
      style="font-size: {fontSize *
        (compact ? 2.2 : 2.6)}px; line-height: 1.04;">
      {specimen.word}
    </div>
    <div class="specimen-extract mt-3" style={extractStyle}>
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
</div>

<style>
/* Scheme colours (--ground/--ink/--link) set inline; border/divider mix from
   the ink so they read on any ground. */
.specimen-preview {
  background: var(--ground);
  color: var(--ink);
  border: 1px solid color-mix(in srgb, var(--ink) 16%, transparent);
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
