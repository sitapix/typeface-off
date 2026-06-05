<script lang="ts">
import { base } from '$app/paths';
import { page } from '$app/state';
import Icon from './Icon.svelte';

// Mobile-only primary navigation (lg:hidden). On a phone the three destinations
// can't share the top bar with the wordmark + appearance controls without
// crowding it (and clipping the dark-mode toggle off-screen), so they live in a
// thumb-reachable bottom tab bar instead — the standard small-screen pattern,
// always showing where you are. Desktop keeps the inline links in Header.
// `onhome` mirrors Header: on the home route a Game tap acts (e.g. the game
// restarts a finished result) instead of re-navigating to the current URL.
let { onhome }: { onhome?: () => void } = $props();

const homeHref = `${base}/`;
const browseHref = `${base}/browse`;
const aboutHref = `${base}/about`;
const items = [
  { href: homeHref, label: 'Game', icon: 'bracket' },
  { href: browseHref, label: 'Browse', icon: 'compare' },
  { href: aboutHref, label: 'About', icon: 'info' }
];

// Trailing-slash-insensitive match so the base root ('' vs '/') still lights up.
const norm = (p: string) => p.replace(/\/+$/, '') || '/';
const here = $derived(norm(page.url.pathname));

// Font-detail pages ('/SpaceGrotesk', …) are reached from Browse and are part of
// browsing, so light Browse for any route that isn't one of the three top-level
// destinations — keeps the bar oriented instead of reading as "nowhere".
const isActive = (href: string) => {
  if (norm(href) === norm(browseHref))
    return here !== norm(homeHref) && here !== norm(aboutHref);
  return here === norm(href);
};

function handleClick(event: MouseEvent, href: string) {
  if (norm(href) === norm(homeHref) && isActive(href) && onhome) {
    event.preventDefault();
    onhome();
  }
}
</script>

<nav
  aria-label="Primary"
  class="bottom-nav shrink-0 border-t border-surface-200-800 bg-surface-100-900 lg:hidden">
  <ul class="mx-auto flex max-w-md items-stretch justify-around">
    {#each items as item (item.href)}
      <li class="flex-1">
        <a
          href={item.href}
          onclick={(e) => handleClick(e, item.href)}
          aria-current={isActive(item.href) ? 'page' : undefined}
          class="flex h-full items-center justify-center py-1.5 transition-colors {isActive(
            item.href
          )
            ? 'text-primary-500'
            : 'text-surface-800-200 hover:text-surface-900-100'}">
          <!-- Active item gets a tinted pill, not just a colour change, so the
               current tab is distinguishable without relying on hue alone (WCAG
               color-not-only) — and aria-current carries it for screen readers. -->
          <span
            class="flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-xl px-4 py-1 text-[11px] font-medium leading-none {isActive(
              item.href
            )
              ? 'bg-primary-500/15'
              : ''}">
            <Icon name={item.icon} size={22} />
            <span>{item.label}</span>
          </span>
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
/* Clear the home-indicator / gesture area on notched phones. */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
