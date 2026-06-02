<script lang="ts">
import type { Snippet } from 'svelte';

// Layout shell replacing Skeleton v2's <AppShell> (removed in v3/v4):
// sticky app header, optional left sidebar (the Sidebar component handles its
// own mobile-drawer behavior), a sticky per-page sub-header, and scrollable main.
let {
  header,
  sidebar,
  pageHeader,
  children,
  headerClass = '',
  pageHeaderClass = ''
}: {
  header?: Snippet;
  sidebar?: Snippet;
  pageHeader?: Snippet;
  children: Snippet;
  /** Extra classes for the header/page-header wrappers (e.g. to collapse them). */
  headerClass?: string;
  pageHeaderClass?: string;
} = $props();
</script>

<div class="flex h-full flex-col overflow-hidden">
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-primary-contrast-500"
    >Skip to content</a>
  {#if header}
    <header class="z-30 shrink-0 {headerClass}">{@render header()}</header>
  {/if}

  <div class="relative flex min-h-0 flex-1 overflow-hidden">
    {#if sidebar}
      <div class="relative w-0 shrink-0 lg:w-[22rem]">{@render sidebar()}</div>
    {/if}

    <!-- The mobile sidebar (Sidebar.svelte) is a full-width drawer that slides
         over this column, so nothing needs to move here. On lg the sidebar is a
         static left column and this is the main content beside it. -->
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      {#if pageHeader}
        <div class="z-10 shrink-0 {pageHeaderClass}">
          {@render pageHeader()}
        </div>
      {/if}
      <main id="main-content" class="min-h-0 flex-1 overflow-auto">
        {@render children()}
      </main>
    </div>
  </div>
</div>
