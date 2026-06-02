<script lang="ts">
// A "natural" specimen: renders a real encyclopedia-style article (heading,
// running prose with links, bold, italics, a citation, and a glyph row) inside
// a browser-window frame — so you judge the font the way you'd actually read it
// on the web, not as abstract pangram lines. When `editable`, the headline turns
// into an in-place type tester bound to the shared `previewText` store, so you
// can set your own copy once and compare it across fonts.
import { previewText } from '$lib/store.svelte';
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
</script>

<div
  class="article-preview flex h-full w-full flex-col overflow-hidden rounded-lg border border-surface-300-700 bg-surface-50-950 shadow-lg {className}">
  <!-- browser chrome (neutral UI font, not the specimen) -->
  <div
    class="flex items-center gap-2 border-b border-surface-300-700 bg-surface-100-900 px-4 py-2">
    <span class="h-3 w-3 rounded-full bg-[#ff5f56]"></span>
    <span class="h-3 w-3 rounded-full bg-[#ffbd2e]"></span>
    <span class="h-3 w-3 rounded-full bg-[#27c93f]"></span>
    <span class="ml-2 truncate text-sm opacity-60"
      >en.wikipedia.org › Kola nut</span>
  </div>

  <!-- article body (rendered in the specimen font) -->
  <article
    class="article-body flex-1 overflow-auto px-6 py-5"
    style="font-family: '{fontFamily}', sans-serif; font-size: {fontSize}px; line-height: 1.6;">
    {#if editable}
      <div
        class="tester-heading cursor-text rounded font-bold outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
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
      <a class="text-primary-600-400 underline" href="#kola">rainforests</a>
      of Africa. Their
      <a class="text-primary-600-400 underline" href="#caffeine">caffeine</a
      >-containing seeds are used as flavoring in various carbonated soft
      drinks; the name <em class="italic">cola</em> derives from this use.<sup
        class="align-super text-[0.7em] text-primary-600-400">[1]</sup>
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
/* Placeholder for the empty type-tester headline. */
.tester-heading:empty::before {
  content: attr(data-placeholder);
  opacity: 0.4;
}
</style>
