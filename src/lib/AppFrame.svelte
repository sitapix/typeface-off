<script lang="ts">
import type { Snippet } from 'svelte';

// Layout shell replacing Skeleton v2's <AppShell> (removed in v3/v4):
// sticky app header, optional left sidebar (the Sidebar component handles its
// own mobile-drawer behavior), a sticky per-page sub-header, and scrollable main.
let {
  header,
  sidebar,
  pageHeader,
  children
}: {
  header?: Snippet;
  sidebar?: Snippet;
  pageHeader?: Snippet;
  children: Snippet;
} = $props();
</script>

<div class="flex h-full flex-col overflow-hidden">
  {#if header}
    <header class="z-30 shrink-0">{@render header()}</header>
  {/if}

  <div class="relative flex min-h-0 flex-1 overflow-hidden">
    {#if sidebar}
      <div class="relative w-0 shrink-0 lg:w-[22rem]">{@render sidebar()}</div>
    {/if}

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      {#if pageHeader}
        <div class="z-20 shrink-0">{@render pageHeader()}</div>
      {/if}
      <main class="min-h-0 flex-1 overflow-auto">{@render children()}</main>
    </div>
  </div>
</div>
