<script lang="ts">
import Icon from './Icon.svelte';
import { theme } from './store.svelte';

// Keep this list in sync with the @import'd themes in src/app.css.
const themes = [
  { id: 'cerberus', name: 'Cerberus' },
  { id: 'wintry', name: 'Wintry' },
  { id: 'catppuccin', name: 'Catppuccin' },
  { id: 'crimson', name: 'Crimson' },
  { id: 'hamlindigo', name: 'Hamlindigo' },
  { id: 'mint', name: 'Mint' },
  { id: 'mona', name: 'Mona' },
  { id: 'pine', name: 'Pine' },
  { id: 'rose', name: 'Rosé' },
  { id: 'sahara', name: 'Sahara' },
  { id: 'terminus', name: 'Terminus' },
  { id: 'vintage', name: 'Vintage' }
];

let open = $state(false);

// Apply the chosen scheme to <html> (client-only); persisted across reloads.
$effect(() => {
  document.documentElement.dataset.theme = theme.value;
});

function choose(id: string) {
  theme.value = id;
  open = false;
}
</script>

<svelte:window
  onkeydown={(e) => {
    if (open && e.key === 'Escape') open = false;
  }} />

<div class="relative">
  <button
    class="btn-icon preset-tonal-surface"
    onclick={() => (open = !open)}
    aria-haspopup="menu"
    aria-expanded={open}
    aria-label="Choose color theme"
    title="Color theme">
    <Icon name="palette" size={22} />
  </button>

  {#if open}
    <!-- click-outside catcher -->
    <button
      type="button"
      class="fixed inset-0 z-40 cursor-default"
      aria-label="Close theme menu"
      onclick={() => (open = false)}></button>

    <div
      class="absolute right-0 z-50 mt-2 grid w-60 grid-cols-2 gap-1 rounded-lg border border-surface-200-800 bg-surface-100-900 p-2 shadow-xl"
      role="menu"
      aria-label="Color theme">
      {#each themes as t (t.id)}
        <button
          type="button"
          role="menuitemradio"
          aria-checked={theme.value === t.id}
          data-theme={t.id}
          class="flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:preset-tonal-surface {theme.value ===
          t.id
            ? 'preset-tonal-primary'
            : ''}"
          onclick={() => choose(t.id)}>
          <span class="flex shrink-0 overflow-hidden rounded-full">
            <span class="size-3 bg-primary-500"></span>
            <span class="size-3 bg-secondary-500"></span>
            <span class="size-3 bg-tertiary-500"></span>
          </span>
          <span class="truncate">{t.name}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
