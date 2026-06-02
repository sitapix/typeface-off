<script lang="ts">
import { base } from '$app/paths';
import type { Font } from '$lib/fonts';
import Icon from './Icon.svelte';
import { fontSlug } from './slug';

// The Visit / Download / (Details) action group, shared by FontHeader, the
// Browse + detail tables, and the winner certificate. One place so the link
// rules (rel=noopener, base-prefixed detail href, slug) can't drift.
let {
  font,
  size = 16,
  showLabels = false,
  details = true,
  detailLabel = '',
  groupClass = 'preset-outlined-surface-500 [&>*+*]:border-surface-400-600'
}: {
  font: Font;
  /** Icon size in px. */
  size?: number;
  /** Show Visit/Download text alongside the icons (revealed at 2xl). */
  showLabels?: boolean;
  /** Include the "view detail" (maximize) link. */
  details?: boolean;
  /** Text for the detail link when showLabels is on (empty = icon only). */
  detailLabel?: string;
  /** Extra classes for the btn-group wrapper (preset, alignment, etc.). */
  groupClass?: string;
} = $props();
</script>

<div class="btn-group {groupClass}">
  <a
    class="btn"
    href={font.siteUrl}
    target="_blank"
    rel="noopener"
    aria-label="Visit {font.family} website">
    <Icon name="external" {size} />
    {#if showLabels}<span class="hidden 2xl:block">Visit {font.family}</span>{/if}
  </a>
  <a class="btn" href={font.downloadUrl} aria-label="Download {font.family}">
    <Icon name="download" {size} />
    {#if showLabels}<span class="hidden 2xl:block">Download {font.family}</span
      >{/if}
  </a>
  {#if details}
    <a
      class="btn"
      href="{base}/{fontSlug(font.family)}"
      aria-label="View {font.family} details">
      <Icon name="maximize" {size} />
      {#if showLabels && detailLabel}<span class="hidden 2xl:block"
          >{detailLabel}</span
        >{/if}
    </a>
  {/if}
</div>
