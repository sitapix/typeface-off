<script lang="ts">
import { base } from '$app/paths';
import type { Font } from '$lib/fonts';
import FontLinks from './FontLinks.svelte';
import { fontSlug } from './slug';
import { showName } from '$lib/store.svelte';

let { font }: { font?: Font } = $props();

const slug = $derived(font ? fontSlug(font.family) : '');
</script>

{#if showName.value && font}
  <div class="flex flex-row items-center justify-between gap-2">
    <div class="flex min-w-0 flex-col">
      <a
        href="{base}/{slug}"
        class="h3 truncate whitespace-nowrap hover:underline">{font.family}</a>
      {#if font.designer}
        <span class="truncate text-sm opacity-60" title={font.designer}
          >by {font.designer}</span>
      {/if}
    </div>
    <FontLinks
      {font}
      size={24}
      showLabels
      groupClass="preset-outlined-surface-500 shrink-0 [&>*+*]:border-surface-400-600" />
  </div>
{/if}
