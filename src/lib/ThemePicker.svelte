<script lang="ts">
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';
import Icon from './Icon.svelte';
import { theme } from './store.svelte';

// 21 Skeleton preset themes — keep in sync with the @import'd themes in
// src/app.css. (Reign is omitted: its near-yellow primary washed out
// `preset-tonal-primary` text.) The Menu component (Zag.js) owns open/close,
// click-outside, Escape, keyboard roving, focus, and ARIA; we only render rows.
const themes = [
  { id: 'catppuccin', name: 'Catppuccin' },
  { id: 'cerberus', name: 'Cerberus' },
  { id: 'concord', name: 'Concord' },
  { id: 'crimson', name: 'Crimson' },
  { id: 'fennec', name: 'Fennec' },
  { id: 'hamlindigo', name: 'Hamlindigo' },
  { id: 'legacy', name: 'Legacy' },
  { id: 'mint', name: 'Mint' },
  { id: 'modern', name: 'Modern' },
  { id: 'mona', name: 'Mona' },
  { id: 'nosh', name: 'Nosh' },
  { id: 'nouveau', name: 'Nouveau' },
  { id: 'pine', name: 'Pine' },
  { id: 'rocket', name: 'Rocket' },
  { id: 'rose', name: 'Rosé' },
  { id: 'sahara', name: 'Sahara' },
  { id: 'seafoam', name: 'Seafoam' },
  { id: 'terminus', name: 'Terminus' },
  { id: 'vintage', name: 'Vintage' },
  { id: 'vox', name: 'Vox' },
  { id: 'wintry', name: 'Wintry' }
];

// Apply the chosen scheme to <html> (client-only); persisted across reloads.
$effect(() => {
  document.documentElement.dataset.theme = theme.value;
});
</script>

<Menu
  positioning={{ placement: 'bottom-end', gutter: 8 }}
  onSelect={(details) => (theme.value = details.value)}>
  <Menu.Trigger
    class="btn-icon preset-tonal-surface"
    aria-label="Choose color theme"
    title="Color theme">
    <Icon name="palette" size={22} />
  </Menu.Trigger>
  <Portal>
    <Menu.Positioner>
      <Menu.Content
        class="z-50 flex max-h-[70vh] w-56 flex-col gap-0.5 overflow-y-auto rounded-lg border border-surface-200-800 bg-surface-100-900 p-1.5 shadow-xl focus:outline-none">
        {#each themes as t (t.id)}
          <Menu.OptionItem
            type="radio"
            value={t.id}
            checked={theme.value === t.id}
            class="flex w-full cursor-pointer select-none items-center gap-2.5 rounded px-2.5 py-2 text-sm data-[highlighted]:preset-tonal-surface data-[state=checked]:preset-tonal-primary">
            <span
              data-theme={t.id}
              class="flex shrink-0 overflow-hidden rounded-full border border-surface-300-700">
              <span class="size-3.5 bg-primary-500"></span>
              <span class="size-3.5 bg-secondary-500"></span>
              <span class="size-3.5 bg-tertiary-500"></span>
            </span>
            <Menu.ItemText class="flex-1 whitespace-nowrap"
              >{t.name}</Menu.ItemText>
            <Menu.ItemIndicator class="shrink-0">
              <Icon name="check" size={16} />
            </Menu.ItemIndicator>
          </Menu.OptionItem>
        {/each}
      </Menu.Content>
    </Menu.Positioner>
  </Portal>
</Menu>
