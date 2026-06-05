<script lang="ts">
import type { Snippet } from 'svelte';
import { menuOpen } from '$lib/store.svelte';

// `pinned` (optional) stays fixed at the top of the mobile drawer while the rest
// scrolls — e.g. Browse pins a live preview of the selected font above the list.
// `drawer` (default true) is the mobile slide-in behaviour. A page with no mobile
// entry point for the sidebar (the Game: filters are inline and the header omits
// the menu toggle) passes `drawer={false}` so the rail is desktop-only rather
// than an unreachable, redundant off-screen overlay (and a phantom landmark).
let {
  children,
  pinned,
  drawer = true
}: { children?: Snippet; pinned?: Snippet; drawer?: boolean } = $props();

let scroller: HTMLDivElement;

export function scrollToTop() {
  scroller?.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<!-- Mobile: full-width drawer that slides over the content (close via the header
     toggle, which becomes an ✕ while open). Desktop (lg): static in-flow column.
     With drawer=false there's no mobile presence at all — the rail exists only
     from lg up (no off-screen overlay, no duplicate landmark). -->
<aside
  id="app-sidebar"
  aria-label="Sidebar"
  class={drawer
    ? 'absolute z-20 flex h-full w-screen flex-col bg-surface-100-900 shadow-xl transition-transform duration-200 ease-out lg:static lg:w-full lg:translate-x-0 lg:shadow-none'
    : 'hidden h-full w-full flex-col bg-surface-100-900 lg:flex'}
  class:-translate-x-full={drawer && !menuOpen.value}>
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
  <footer class="shrink-0 px-4 pb-4 pt-2 text-xs text-surface-800-200">
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
</aside>
