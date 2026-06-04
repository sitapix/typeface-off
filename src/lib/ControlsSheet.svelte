<script lang="ts">
import Controls from './Controls.svelte';
import Icon from './Icon.svelte';

// Mobile-only overlay holding the specimen-display Controls (Show Name, Ligatures,
// colour scheme, Font Size). On desktop those live inline in the page sub-header;
// on mobile they'd eat the height the duel needs, so they drop in from the top as
// a dismissible sheet. Pattern mirrors ThemePicker (open state, click-outside
// scrim, Escape, ARIA). lg:hidden — never shows on desktop.
let { open = $bindable(false) }: { open?: boolean } = $props();

let panel = $state<HTMLDivElement>();

// Move focus into the sheet when it opens so keyboard/AT users land inside it.
$effect(() => {
  if (open) panel?.focus();
});
</script>

<svelte:window
  onkeydown={(e) => {
    if (open && e.key === 'Escape') open = false;
  }} />

{#if open}
  <!-- Scrim: dims the duel behind and dismisses on tap. -->
  <button
    type="button"
    class="scrim fixed inset-0 z-40 cursor-default bg-surface-950/40 lg:hidden"
    aria-label="Close specimen settings"
    onclick={() => (open = false)}></button>

  <!-- Sheet: full-width, drops from the top, owns its surface. -->
  <div
    bind:this={panel}
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-label="Specimen settings"
    class="sheet fixed inset-x-0 top-0 z-50 rounded-b-2xl border-b border-surface-200-800 bg-surface-100-900 shadow-xl outline-none lg:hidden">
    <div class="flex items-center justify-between px-4 pt-3">
      <span class="eyebrow text-surface-700-300">Specimen settings</span>
      <button
        class="btn-icon preset-tonal-surface"
        onclick={() => (open = false)}
        aria-label="Close specimen settings">
        <Icon name="x" size={20} />
      </button>
    </div>
    <Controls inSheet />
  </div>
{/if}

<style>
.sheet {
  animation: sheet-in 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
.scrim {
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
@media (prefers-reduced-motion: reduce) {
  .sheet,
  .scrim {
    animation: none;
  }
}
</style>
