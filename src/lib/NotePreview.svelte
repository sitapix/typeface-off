<script lang="ts">
// A "natural" text specimen (read-only), in a browser-window frame so you judge
// the font the way you'd read it on the web. Shows either your own copy — the
// shared `previewText` (SSOT), rendered across styles in this font — or, until
// you've written any, a curated encyclopedia article (the default). Editing
// happens in the in-place SpecimenEditor that replaces the specimen in edit mode.
//
// Renders on the active specimen colour scheme (specimenScheme → SPECIMEN_SCHEMES),
// theme-independent: ground + ink come from the scheme and the whole window is
// tinted from those two via color-mix. Mono fonts use CodePreview, not this.
import {
  previewText,
  specimenScheme,
  isCustomPreview
} from '$lib/store.svelte';
import { schemeAt } from '$lib/specimenSchemes';
let {
  fontFamily = 'Inter',
  fontSize = 20,
  class: className = ''
}: {
  fontFamily?: string;
  fontSize?: number;
  class?: string;
} = $props();

const scheme = $derived(schemeAt(specimenScheme.value));

// Your own copy (the SSOT) takes over once written; otherwise the curated article.
const hasCustom = $derived(isCustomPreview(previewText.value));
</script>

<div
  class="article-preview flex h-full w-full flex-col overflow-hidden rounded-lg shadow-lg {className}"
  style="--ground:{scheme.bg}; --ink:{scheme.fg};">
  <!-- browser chrome (neutral UI font, not the specimen) -->
  <div class="chrome-bar flex items-center gap-2 px-4 py-2">
    <span class="dot h-3 w-3 rounded-full"></span>
    <span class="dot h-3 w-3 rounded-full"></span>
    <span class="dot h-3 w-3 rounded-full"></span>
    <span class="url ml-2 truncate text-sm"
      >{hasCustom ? 'Your text' : 'en.wikipedia.org › Kola nut'}</span>
  </div>

  {#if hasCustom}
    <!-- your own copy (the SSOT), rendered across styles in the specimen font -->
    <article
      class="article-body specimen-custom flex-1 overflow-auto px-6 py-5 text-pretty"
      style="font-family: '{fontFamily}', sans-serif; font-size: {fontSize}px; line-height: 1.6;">
      {@html previewText.value}
    </article>
  {:else}
    <!-- read-only article (rendered in the specimen font) -->
    <article
      class="article-body flex-1 overflow-auto px-6 py-5 text-pretty"
      style="font-family: '{fontFamily}', sans-serif; font-size: {fontSize}px; line-height: 1.6;">
      <h1
        class="font-bold text-balance"
        style="font-size: {fontSize * 1.9}px; line-height: 1.2;">
        Kola nut
      </h1>
      <p class="mt-3">
        The <strong class="font-semibold">kola nut</strong> is the seed of
        certain species of plant of the genus <em class="italic">Cola</em>,
        native to the tropical
        <span class="link underline">rainforests</span>
        of Africa. Their
        <span class="link underline">caffeine</span>-containing seeds are used
        as flavoring in various carbonated soft drinks; the name
        <em class="italic">cola</em>
        derives from this use.<sup class="cite align-super text-[0.7em]"
          >[1]</sup>
      </p>
      <p class="mt-3 opacity-90">
        Chewed in West African cultures individually or in a social setting, the
        nut has a bitter flavor and is offered to guests as a sign of
        hospitality &amp; friendship — often shared at weddings, funerals, and
        naming ceremonies.
      </p>
      <p
        class="mt-4 opacity-70"
        style="font-size: {fontSize * 0.85}px; line-height: 1.5;">
        0123456789 — ABCDEFG abcdefg .,;:!?‘’“”&amp;@#%*()
      </p>
    </article>
  {/if}
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
/* Most catalog fonts ship only a regular weight, so faux-bold smears at display
   size — render real bold when present, crisp regular otherwise. */
h1 {
  font-synthesis: none;
}
/* Rendered custom copy ({@html} — Tiptap HTML from the SSOT): headings give
   display-size testing, body reads at the specimen size. Real bold/italic when
   the cut is loaded, crisp regular/upright otherwise (never a smeared faux). */
.specimen-custom :global(h1) {
  font-weight: 700;
  font-size: 1.9em;
  line-height: 1.2;
}
.specimen-custom :global(h2) {
  font-weight: 700;
  font-size: 1.4em;
  line-height: 1.25;
  margin-top: 0.5em;
}
.specimen-custom :global(p) {
  margin: 0;
}
.specimen-custom :global(h1 + p),
.specimen-custom :global(h2 + p),
.specimen-custom :global(p + p) {
  margin-top: 0.6em;
}
.specimen-custom :global(strong) {
  font-weight: 700;
}
.specimen-custom :global(em) {
  font-style: italic;
}
</style>
