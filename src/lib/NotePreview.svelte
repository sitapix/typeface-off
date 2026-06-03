<script lang="ts">
// A "natural" specimen: renders a real encyclopedia-style article (heading,
// running prose with links, bold, italics, a citation, and a glyph row) inside
// a browser-window frame — so you judge the font the way you'd actually read it
// on the web, not as abstract pangram lines. When `editable`, the headline turns
// into an in-place type tester bound to the shared `previewText` store, so you
// can set your own copy once and compare it across fonts.
//
// The specimen renders on the active bold colour scheme (specimenScheme store →
// SPECIMEN_SCHEMES), theme-independent: ground + ink come from the scheme and
// the whole window (chrome bar, dots, links, citation) is tinted from those two
// colours via color-mix, so a face is judged on real grounds. Mono fonts use
// CodePreview instead and never reach here.
import { previewText, specimenScheme } from '$lib/store.svelte';
import { schemeAt } from '$lib/specimenSchemes';
let {
  fontFamily = 'Inter',
  fontSize = 20,
  class: className = '',
  editable = false,
  text = ''
}: {
  fontFamily?: string;
  fontSize?: number;
  class?: string;
  /** Make the headline an in-place tester bound to `previewText`. */
  editable?: boolean;
  /** Headline text for read-only specimens (falls back to the sample heading). */
  text?: string;
} = $props();

const scheme = $derived(schemeAt(specimenScheme.value));
</script>

<div
  class="article-preview flex h-full w-full flex-col overflow-hidden rounded-lg shadow-lg {className}"
  style="--ground:{scheme.bg}; --ink:{scheme.fg};">
  <!-- browser chrome (neutral UI font, not the specimen) -->
  <div class="chrome-bar flex items-center gap-2 px-4 py-2">
    <span class="dot h-3 w-3 rounded-full"></span>
    <span class="dot h-3 w-3 rounded-full"></span>
    <span class="dot h-3 w-3 rounded-full"></span>
    <span class="url ml-2 truncate text-sm">en.wikipedia.org › Kola nut</span>
  </div>

  <!-- article body (rendered in the specimen font) -->
  <article
    class="article-body flex-1 overflow-auto px-6 py-5"
    style="font-family: '{fontFamily}', sans-serif; font-size: {fontSize}px; line-height: 1.6;">
    {#if editable}
      <div
        class="tester-heading cursor-text rounded font-bold outline-none"
        style="font-size: {fontSize * 1.9}px; line-height: 1.2;"
        contenteditable="plaintext-only"
        role="textbox"
        aria-multiline="true"
        aria-label="Preview text"
        spellcheck="false"
        data-placeholder="Type to preview"
        bind:textContent={previewText.value}>
      </div>
    {:else}
      <h1
        class="font-bold"
        style="font-size: {fontSize * 1.9}px; line-height: 1.2;">
        {text || 'Kola nut'}
      </h1>
    {/if}
    <p class="mt-3">
      The <strong class="font-semibold">kola nut</strong> is the seed of certain
      species of plant of the genus <em class="italic">Cola</em>, native to the
      tropical
      <a class="link underline" href="#kola">rainforests</a>
      of Africa. Their
      <a class="link underline" href="#caffeine">caffeine</a>-containing seeds
      are used as flavoring in various carbonated soft drinks; the name
      <em class="italic">cola</em>
      derives from this use.<sup class="cite align-super text-[0.7em]">[1]</sup>
    </p>
    <p class="mt-3 opacity-90">
      Chewed in West African cultures individually or in a social setting, the
      nut has a bitter flavor and is offered to guests as a sign of hospitality
      &amp; friendship — often shared at weddings, funerals, and naming
      ceremonies.
    </p>
    <p
      class="mt-4 opacity-70"
      style="font-size: {fontSize * 0.85}px; line-height: 1.5;">
      0123456789 — ABCDEFG abcdefg .,;:!?‘’“”&amp;@#%*()
    </p>
  </article>
</div>

<style>
/* The specimen renders on its own scheme (--ground / --ink), set inline from
   the active SPECIMEN_SCHEME. Every other tint is mixed from those two so the
   window stays coherent on white, black, or a saturated ground. */
.article-preview {
  background: var(--ground);
  color: var(--ink);
  border: 1px solid color-mix(in srgb, var(--ink) 16%, transparent);
}
.chrome-bar {
  background: color-mix(in srgb, var(--ink) 6%, var(--ground));
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 14%, transparent);
}
.dot {
  background: var(--ink);
  opacity: 0.3;
}
.url {
  opacity: 0.55;
}
.article-body .link {
  color: var(--ink);
}
.article-body .cite {
  color: var(--ink);
  opacity: 0.75;
}
/* Type-tester focus ring in the scheme's own ink (the theme accent could clash
   with a coloured ground). */
.tester-heading:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 4px;
}
/* Placeholder for the empty type-tester headline. */
.tester-heading:empty::before {
  content: attr(data-placeholder);
  opacity: 0.4;
}
</style>
