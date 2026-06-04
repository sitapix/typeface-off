<script lang="ts">
import {
  showName,
  fontSize,
  ligatures,
  specimenScheme
} from '$lib/store.svelte';
import { SPECIMEN_SCHEMES } from '$lib/specimenSchemes';

// `inSheet` = rendered inside the mobile ControlsSheet overlay, which owns the
// surface — so drop the inline bar's border/background and stack the groups with
// room to breathe. Default (desktop pageHeader) keeps the compact one-line bar.
let { inSheet = false }: { inSheet?: boolean } = $props();
</script>

<div
  class={inSheet
    ? 'flex flex-col gap-4 px-4 pb-4 pt-2'
    : 'flex flex-row flex-wrap items-center gap-x-4 gap-y-2 border-b border-surface-200-800 bg-surface-100-900 px-4 py-2'}>
  <label class="flex items-center space-x-2">
    <input class="checkbox" type="checkbox" bind:checked={showName.value} />
    <span>Show Name</span>
  </label>
  <label
    class="flex items-center space-x-2"
    title="Ligatures apply to coding (mono) fonts">
    <input class="checkbox" type="checkbox" bind:checked={ligatures.value} />
    <span>Ligatures</span>
  </label>

  <!-- Specimen colour scheme: each swatch is the actual fg-on-bg pair, so you
       pick by sight. Recolours text (non-mono) specimens only; mono uses the
       code editor and ignores this. -->
  <div
    class="flex items-center gap-2"
    title="Colour schemes apply to text fonts (not mono)">
    <span>Specimen:</span>
    <div
      class="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Specimen color scheme">
      {#each SPECIMEN_SCHEMES as s, i (s.id)}
        <button
          type="button"
          class="specimen-swatch"
          class:selected={specimenScheme.value === i}
          style="background:{s.bg}; color:{s.fg};"
          aria-pressed={specimenScheme.value === i}
          aria-label={s.label}
          title={s.label}
          onclick={() => (specimenScheme.value = i)}>Aa</button>
      {/each}
    </div>
  </div>

  <label class="flex flex-1 flex-row items-center gap-2 whitespace-nowrap">
    <span>Font Size:</span>
    <input
      class="input w-16"
      type="number"
      inputmode="numeric"
      min="10"
      max="72"
      bind:value={fontSize.value} />
    <span class="text-sm opacity-60">px</span>
    <input
      class="min-w-32 flex-1 accent-primary-500 lg:max-w-60"
      type="range"
      aria-label="Font size"
      min="10"
      max="72"
      step="1"
      bind:value={fontSize.value} />
  </label>
</div>

<style>
.specimen-swatch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}
.specimen-swatch:hover {
  transform: translateY(-1px);
}
/* Selected: an inner frame in the swatch's own ink — distinct from the focus
   ring and not a colour-only cue (it pairs with aria-pressed). */
.specimen-swatch.selected {
  box-shadow: inset 0 0 0 2px currentColor;
}
.specimen-swatch:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .specimen-swatch {
    transition: none;
  }
}
</style>
