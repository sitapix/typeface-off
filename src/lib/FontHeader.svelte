<script lang="ts">
import { base } from '$app/paths';
import type { Font } from '$lib/fonts';
import { Icon } from '$lib';
import { showName } from '$lib/store.svelte';

let { font }: { font?: Font } = $props();

const slug = $derived(
  font ? encodeURIComponent(font.family.replace(/\s+/g, '')) : ''
);
</script>

{#if showName.value && font}
  <div class="flex flex-row items-center justify-between gap-2">
    <a
      href="{base}/{slug}"
      class="h3 min-w-0 truncate whitespace-nowrap hover:underline"
      >{font.family}</a>
    <div
      class="btn-group preset-outlined-surface-500 shrink-0 [&>*+*]:border-surface-400-600">
      <a
        class="btn"
        href={font.siteUrl}
        target="_blank"
        rel="noopener"
        aria-label="Visit {font.family} website">
        <Icon name="external" size={24} />
        <span class="hidden 2xl:block">Visit {font.family}</span>
      </a>
      <a
        class="btn"
        href={font.downloadUrl}
        aria-label="Download {font.family}">
        <Icon name="download" size={24} />
        <span class="hidden 2xl:block">Download {font.family}</span>
      </a>
      <a
        class="btn"
        href="{base}/{slug}"
        aria-label="View {font.family} details">
        <Icon name="maximize" size={24} />
      </a>
    </div>
  </div>
{/if}
