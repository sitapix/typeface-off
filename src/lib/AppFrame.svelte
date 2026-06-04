<script lang="ts">
import type { Snippet } from 'svelte';
import ResizeHandle from './ResizeHandle.svelte';
import { sidebarWidth } from '$lib/store.svelte';

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
      <div
        class="sidebar-rail relative w-0 shrink-0"
        style="--sidebar-width: {sidebarWidth.value}px">
        {@render sidebar()}
        <ResizeHandle />
      </div>
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

<style>
/* Desktop rail width: user-draggable (--sidebar-width, persisted) but clamped so
   the duel specimens never get crushed. Mobile keeps Tailwind's `w-0` (the
   Sidebar component renders as a full-screen drawer there). */
@media (min-width: 1024px) {
  .sidebar-rail {
    width: clamp(280px, var(--sidebar-width), min(560px, 42vw));
  }
}
</style>
