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
  <!-- The designer line is always rendered (an &nbsp; placeholder when a font has
       no credited designer) so the header is a constant two-line height. In the
       duel that keeps both specimens the same height and their tops aligned;
       elsewhere it keeps the cards on a tidy grid. -->
  <div class="flex flex-row items-center justify-between gap-2">
    <div class="flex min-w-0 flex-col">
      <a
        href="{base}/{slug}"
        class="h3 truncate whitespace-nowrap hover:underline">{font.family}</a>
      <span class="truncate text-sm opacity-60" title={font.designer}
        >{font.designer ? `by ${font.designer}` : ' '}</span>
    </div>
    <FontLinks
      font={font}
      size={24}
      showLabels
      groupClass="preset-outlined-surface-500 shrink-0 [&>*+*]:border-surface-400-600" />
  </div>
{/if}
