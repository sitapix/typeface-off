<script lang="ts">
import type { Snippet } from 'svelte';
import { menuOpen } from '$lib/store.svelte';

let { children }: { children?: Snippet } = $props();

let sidebar: HTMLDivElement;

export function scrollToTop() {
  sidebar?.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<div
  bind:this={sidebar}
  class="absolute z-20 flex h-full w-[calc(100vw-4rem)] flex-col gap-4 overflow-y-auto overflow-x-visible border-r border-surface-200-800 bg-surface-100-800 p-4 sm:w-[30rem] lg:static lg:w-full"
  class:hide={!menuOpen.value}>
  {@render children?.()}
</div>
