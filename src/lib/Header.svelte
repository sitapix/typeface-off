<script lang="ts">
import { page } from '$app/state';
import { Icon, Logo, ThemeSwitch } from '$lib';
import { menuOpen } from '$lib/store.svelte';

const links = [
  { href: '/', label: 'Game' },
  { href: '/browse', label: 'Browse' }
];
</script>

<div
  class="flex flex-row items-center justify-between gap-4 border-b border-surface-200-800 bg-surface-100-800 p-4">
  <div class="flex items-center justify-center gap-4">
    <button
      class="btn-icon preset-tonal-surface lg:hidden"
      onclick={() => (menuOpen.value = !menuOpen.value)}
      aria-label="Toggle menu">
      <Icon name="menu" size={24} />
    </button>
    <a href="/"><Logo class="h-[3rem] w-auto" /></a>
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
