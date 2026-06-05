<script lang="ts">
import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
import Controls from './Controls.svelte';
import ThemePicker from './ThemePicker.svelte';
import ToggleSwitch from './ToggleSwitch.svelte';
import Icon from './Icon.svelte';
import { colorScheme } from './store.svelte';

// Mobile-only Settings sheet — the single appearance entry on a phone. Holds the
// app-wide look (colour theme + light/dark) plus the specimen-display Controls
// (Show Name, Ligatures, Edit, scheme/code swatch, Font Size). On desktop the
// theme controls live in the header and these Controls live inline in the page
// sub-header; on mobile the header is usually collapsed during play, so it all
// drops in from the top here. `category` gates which swatch row Controls shows.
// Skeleton's Dialog (Zag) owns the modal behaviour — focus trap, scroll lock,
// inert background, Escape, click-outside (all on by default with modal). The
// rendered parts are lg:hidden so it never shows on desktop.
let {
  open = $bindable(false),
  category
}: { open?: boolean; category?: string } = $props();
</script>

<Dialog open={open} onOpenChange={(d) => (open = d.open)}>
  <Portal>
    <Dialog.Backdrop
      class="cs-scrim fixed inset-0 z-40 bg-surface-950/40 lg:hidden" />
    <Dialog.Positioner class="fixed inset-x-0 top-0 z-50 lg:hidden">
      <Dialog.Content
        class="cs-sheet rounded-b-2xl border-b border-surface-200-800 bg-surface-100-900 shadow-xl outline-none">
        <div class="flex items-center justify-between px-4 pt-3">
          <Dialog.Title class="eyebrow text-surface-800-200"
            >Settings</Dialog.Title>
          <Dialog.CloseTrigger
            class="btn-icon preset-tonal-surface"
            aria-label="Close settings">
            <Icon name="x" size={20} />
          </Dialog.CloseTrigger>
        </div>

        <!-- Appearance: app-wide look. On desktop this lives in the header, but
             during mobile play the header is collapsed, so it lives here too. -->
        <div class="flex flex-col gap-3 px-4 pt-3">
          <span class="eyebrow text-surface-800-200">Appearance</span>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span>Site theme</span>
              <ThemePicker />
            </div>
            <ToggleSwitch
              label="Dark mode"
              bind:checked={
                () => colorScheme.value === 'dark',
                (v) => (colorScheme.value = v ? 'dark' : 'light')
              } />
          </div>
        </div>

        <div class="mx-4 mt-3 border-t border-surface-200-800"></div>
        <span class="eyebrow px-4 pt-3 text-surface-800-200">Specimen</span>
        <Controls inSheet category={category} />
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

<style>
/* The Dialog content/backdrop are rendered by a child component and portaled to
   <body>, so they're outside this component's style scope — :global is required.
   Zag toggles data-state and hides them when closed, so the enter animation
   replays each time the sheet opens. */
:global(.cs-sheet[data-state='open']) {
  animation: sheet-in 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
:global(.cs-scrim[data-state='open']) {
  animation: scrim-in 0.22s ease;
}
@keyframes sheet-in {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}
@keyframes scrim-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
