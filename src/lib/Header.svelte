<script lang="ts">
import { base } from '$app/paths';
import { page } from '$app/state';
import { Icon, Logo, ThemePicker, ThemeSwitch } from '$lib';
import { menuOpen } from '$lib/store.svelte';

// `showMenu` controls the mobile hamburger. Pages without a mobile drawer
// (e.g. the game, whose filters are surfaced inline) pass showMenu={false}.
// `onhome` lets a page act on a click of the logo / Game link when you're
// already on the home route (otherwise a no-op) — the game uses it to escape a
// finished result instead of leaving the logo feeling dead.
let { showMenu = true, onhome }: { showMenu?: boolean; onhome?: () => void } =
  $props();

// Prefix with `base` so links resolve on a GitHub Pages project site
// (you.github.io/REPO); `base` is '' for a root/custom-domain deploy.
const homeHref = `${base}/`;
const links = [
  { href: homeHref, label: 'Game' },
  { href: `${base}/browse`, label: 'Browse' },
  { href: `${base}/about`, label: 'About' }
];

// Trailing-slash-insensitive match so the base root ('' vs '/') still highlights.
const norm = (p: string) => p.replace(/\/+$/, '') || '/';
const isHome = $derived(norm(page.url.pathname) === norm(homeHref));

// On the home route the home links would just re-navigate to the current URL
// (a no-op). Hand that click to the page instead, if it wants it.
function handleHomeNav(event: MouseEvent) {
  if (isHome && onhome) {
    event.preventDefault();
    onhome();
  }
}
</script>

<div
  class="flex flex-row items-center justify-between gap-2 border-b border-surface-200-800 bg-surface-100-900 p-3 sm:gap-4 sm:p-4">
  <div class="flex items-center justify-center gap-2 sm:gap-4">
    {#if showMenu}
      <button
        class="btn-icon preset-tonal-surface lg:hidden"
        onclick={() => (menuOpen.value = !menuOpen.value)}
        aria-label={menuOpen.value ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen.value}
        aria-controls="app-sidebar">
        <Icon name={menuOpen.value ? 'x' : 'menu'} size={24} />
      </button>
    {/if}
    <a href="{base}/" aria-label="TypefaceOff home" onclick={handleHomeNav}
      ><Logo class="text-xl sm:text-3xl" /></a>
  </div>

  <!-- Desktop primary nav. On mobile these live in the bottom tab bar
       (BottomNav), keeping the top strip uncrowded so the appearance controls
       never clip off the right edge. -->
  <nav class="hidden items-center gap-1 sm:gap-2 lg:flex">
    {#each links as link (link.href)}
      <a
        href={link.href}
        onclick={(e) => {
          if (norm(link.href) === norm(homeHref)) handleHomeNav(e);
        }}
        aria-current={norm(page.url.pathname) === norm(link.href)
          ? 'page'
          : undefined}
        class="btn btn-sm {norm(page.url.pathname) === norm(link.href)
          ? 'preset-tonal-primary'
          : 'hover:preset-tonal-surface'}">{link.label}</a>
    {/each}
  </nav>

  <div class="flex items-center gap-2">
    <a
      href="https://github.com/sitapix/typeface-off"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="TypefaceOff on GitHub"
      title="View source on GitHub"
      class="btn-icon preset-tonal-surface hidden md:inline-flex">
      <Icon name="github" size={22} />
    </a>
    <ThemePicker />
    <ThemeSwitch />
  </div>
</div>
