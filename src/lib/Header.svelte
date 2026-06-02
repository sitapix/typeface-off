<script lang="ts">
import { base } from '$app/paths';
import { page } from '$app/state';
import { Icon, Logo, ThemePicker, ThemeSwitch } from '$lib';
import { menuOpen } from '$lib/store.svelte';

// `showMenu` controls the mobile hamburger. Pages without a mobile drawer
// (e.g. the game, whose filters are surfaced inline) pass showMenu={false}.
let { showMenu = true }: { showMenu?: boolean } = $props();

// Prefix with `base` so links resolve on a GitHub Pages project site
// (you.github.io/REPO); `base` is '' for a root/custom-domain deploy.
const links = [
  { href: `${base}/`, label: 'Game' },
  { href: `${base}/browse`, label: 'Browse' }
];

// Trailing-slash-insensitive match so the base root ('' vs '/') still highlights.
const norm = (p: string) => p.replace(/\/+$/, '') || '/';
</script>

<div
  class="flex flex-row items-center justify-between gap-4 border-b border-surface-200-800 bg-surface-100-900 p-4">
  <div class="flex items-center justify-center gap-4">
    {#if showMenu}
      <button
        class="btn-icon preset-tonal-surface lg:hidden"
        onclick={() => (menuOpen.value = !menuOpen.value)}
        aria-label="Toggle menu">
        <Icon name="menu" size={24} />
      </button>
    {/if}
    <a href="{base}/" aria-label="TypefaceOff home"
      ><Logo class="text-2xl sm:text-3xl" /></a>
  </div>

  <nav class="hidden items-center gap-2 md:flex">
    {#each links as link (link.href)}
      <a
        href={link.href}
        aria-current={norm(page.url.pathname) === norm(link.href)
          ? 'page'
          : undefined}
        class="btn {norm(page.url.pathname) === norm(link.href)
          ? 'preset-tonal-primary'
          : 'hover:preset-tonal-surface'}">{link.label}</a>
    {/each}
    <a href="https://typogram.co/studio/" class="btn hover:preset-tonal-surface"
      >Studio</a>
  </nav>

  <div class="flex items-center gap-2">
    <a
      href="https://github.com/sitapix/typeface-off"
      target="_blank"
      rel="noopener"
      aria-label="TypefaceOff on GitHub"
      title="View source on GitHub"
      class="btn-icon preset-tonal-surface">
      <Icon name="github" size={22} />
    </a>
    <ThemePicker />
    <ThemeSwitch />
  </div>
</div>
