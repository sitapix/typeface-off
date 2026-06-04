<script lang="ts">
import type { Snippet } from 'svelte';
import { menuOpen } from '$lib/store.svelte';

// `pinned` (optional) stays fixed at the top of the mobile drawer while the rest
// scrolls — e.g. Browse pins a live preview of the selected font above the list.
let { children, pinned }: { children?: Snippet; pinned?: Snippet } = $props();

let scroller: HTMLDivElement;

export function scrollToTop() {
  scroller?.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<!-- Mobile: full-width drawer that slides over the content (close via the header
     toggle, which becomes an ✕ while open). Desktop (lg): static in-flow column. -->
<div
  id="app-sidebar"
  class="absolute z-20 flex h-full w-screen flex-col bg-surface-100-900 shadow-xl transition-transform duration-200 ease-out lg:static lg:w-full lg:translate-x-0 lg:shadow-none"
  class:-translate-x-full={!menuOpen.value}>
  {#if pinned}
    <!-- Fixed at the top of the drawer; only when a drawer is actually used (mobile). -->
    <div class="shrink-0 p-4 pb-2 lg:hidden">
      {@render pinned()}
    </div>
  {/if}
  <div
    bind:this={scroller}
    class="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4">
    {@render children?.()}
  </div>
  <!-- App-wide license note for the Wikipedia specimen text (CC BY-SA); the
       per-item credit is in SpecimenPreview. -->
  <footer class="shrink-0 px-4 pb-4 pt-2 text-xs text-surface-700-300">
    Specimen text from <a
      class="underline decoration-surface-400 underline-offset-2 hover:text-primary-500"
      href="https://en.wikipedia.org/"
      target="_blank"
      rel="noopener noreferrer">Wikipedia</a
    >, licensed
    <a
      class="underline decoration-surface-400 underline-offset-2 hover:text-primary-500"
      href="https://creativecommons.org/licenses/by-sa/4.0/"
      target="_blank"
      rel="noopener noreferrer">CC BY-SA 4.0</a
    >.
  </footer>
</div>
