<script lang="ts">
import type { Snippet } from 'svelte';
import { menuOpen } from '$lib/store.svelte';

let { children }: { children?: Snippet } = $props();

let sidebar: HTMLDivElement;

export function scrollToTop() {
  sidebar?.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<!-- Tap-outside backdrop (mobile only, when the drawer is open) -->
{#if menuOpen.value}
  <button
    type="button"
    aria-label="Close menu"
    class="fixed inset-0 z-10 bg-surface-950/40 lg:hidden"
    onclick={() => (menuOpen.value = false)}></button>
{/if}

<div
  bind:this={sidebar}
  class="absolute z-20 flex h-full w-[calc(100vw-4rem)] flex-col gap-4 overflow-y-auto overflow-x-visible overscroll-contain border-r border-surface-200-800 bg-surface-100-800 p-4 shadow-xl transition-transform duration-200 ease-out sm:w-[30rem] lg:static lg:w-full lg:translate-x-0 lg:shadow-none"
  class:-translate-x-full={!menuOpen.value}>
  {@render children?.()}
</div>
