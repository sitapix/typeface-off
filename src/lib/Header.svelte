<script lang="ts">
import { page } from '$app/state';
import { Icon, Logo, ThemeSwitch } from '$lib';
import { menuOpen } from '$lib/store.svelte';

// `showMenu` controls the mobile hamburger. Pages without a mobile drawer
// (e.g. the game, whose filters are surfaced inline) pass showMenu={false}.
let { showMenu = true }: { showMenu?: boolean } = $props();

const links = [
  { href: '/', label: 'Game' },
  { href: '/browse', label: 'Browse' }
];
</script>

<div
  class="flex flex-row items-center justify-between gap-4 border-b border-surface-200-800 bg-surface-100-800 p-4">
  <div class="flex items-center justify-center gap-4">
    {#if showMenu}
      <button
        class="btn-icon preset-tonal-surface lg:hidden"
        onclick={() => (menuOpen.value = !menuOpen.value)}
        aria-label="Toggle menu">
        <Icon name="menu" size={24} />
      </button>
    {/if}
    <a href="/"><Logo class="h-[2.25rem] w-auto sm:h-[3rem]" /></a>
  </div>

  <nav class="hidden items-center gap-2 md:flex">
    {#each links as link (link.href)}
      <a
        href={link.href}
        class="btn {page.url.pathname === link.href
          ? 'preset-tonal-primary'
          : 'hover:preset-tonal-surface'}">{link.label}</a>
    {/each}
    <a href="https://typogram.co/studio/" class="btn hover:preset-tonal-surface"
      >Studio</a>
  </nav>

  <ThemeSwitch />
</div>
