<script lang="ts">
import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';
import Icon from './Icon.svelte';
import FontSizeSlider from './FontSizeSlider.svelte';
import ToggleSwitch from './ToggleSwitch.svelte';
import {
  showName,
  ligatures,
  specimenScheme,
  editMode,
  codeTheme,
  previewText,
  DEFAULT_TEXT,
  isCustomPreview,
  codeSample
} from '$lib/store.svelte';
import { DEFAULT_CODE } from '$lib/codeSample';
import { SPECIMEN_SCHEMES } from '$lib/specimenSchemes';
import { CODE_THEMES } from '$lib/codeThemes';

// `inSheet` = rendered inside the mobile ControlsSheet overlay, which owns the
// surface — so drop the inline bar's border/background and stack the groups with
// room to breathe. Default (desktop pageHeader) keeps the compact one-line bar.
//
// `category` is the active type context (the Game's selected category, or
// Browse's filter). It gates which swatch row is shown: the Specimen scheme only
// affects text faces and the Code theme only affects mono, so for a single-type
// context we surface just the relevant one and hide the dead control. `all`/
// undefined (Browse's mixed view) keeps both.
// `compact` = the mobile Browse/detail bar. The full bar is a wall on a phone
// (toggles + two swatch rows + size, ~5 rows), so compact keeps the two things
// you actually adjust while comparing — the swatch row and the font size —
// visible, and tucks the low-frequency toggles (and the secondary swatch set)
// behind a single "more" popover. Mutually exclusive with `inSheet`.
let {
  inSheet = false,
  compact = false,
  category
}: { inSheet?: boolean; compact?: boolean; category?: string } = $props();

const showSpecimen = $derived(category !== 'mono');
const showCode = $derived(
  category === 'mono' || category === 'all' || category == null
);

// Compact mode surfaces one swatch row inline (specimen wins when both apply,
// since text faces are the common case) and tucks the other into the popover.
const primaryKind: 'specimen' | 'code' = $derived(
  showSpecimen ? 'specimen' : 'code'
);
const secondaryKind: 'specimen' | 'code' | null = $derived(
  showSpecimen && showCode ? 'code' : null
);

// Reset-to-default for the shared type-tester buffers. Custom copy now persists
// past edit mode (the specimens show it read-only), so this is the universal,
// layout-independent way back to the curated specimen — it works even in the
// mobile duel, where the specimen itself is pointer-events:none and can't host a
// button. Scoped to the active type (mirrors which swatch row shows) and only
// surfaced when there's actually something to revert, so it's never a dead control.
const textCustom = $derived(isCustomPreview(previewText.value));
const codeCustom = $derived(codeSample.value !== DEFAULT_CODE);
const canReset = $derived(
  (showSpecimen && textCustom) || (showCode && codeCustom)
);
const resetLabel = $derived(
  !showSpecimen ? 'Reset code' : !showCode ? 'Reset text' : 'Reset sample'
);
function resetSample() {
  if (showSpecimen && textCustom) previewText.value = DEFAULT_TEXT;
  if (showCode && codeCustom) codeSample.value = DEFAULT_CODE;
}
</script>

<!-- Swatch buttons for one scheme set — shared by the full bar and the compact
     row/popover so the markup (and a11y) stays in one place. -->
{#snippet swatchButtons(kind: 'specimen' | 'code')}
  {#if kind === 'specimen'}
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
  {:else}
    {#each CODE_THEMES as t (t.id)}
      <button
        type="button"
        class="specimen-swatch"
        class:selected={codeTheme.value === t.id}
        style="background:{t.bg}; color:{t.fg};"
        aria-pressed={codeTheme.value === t.id}
        aria-label={t.label}
        title={t.label}
        onclick={() => (codeTheme.value = t.id)}>Aa</button>
    {/each}
  {/if}
{/snippet}

{#snippet toggles()}
  <ToggleSwitch
    label="Show font names"
    description="Turn it off to compare fonts blind."
    bind:checked={showName.value} />
  {#if showCode}
    <ToggleSwitch
      label="Code ligatures"
      description="Merge symbols like != and => into single glyphs."
      bind:checked={ligatures.value} />
  {/if}
  <ToggleSwitch
    label="Type your own sample"
    description="Swap in your own text or code. It shows in every font."
    bind:checked={editMode.value} />
  {#if canReset}
    <!-- Only shown when your copy differs from the default — the way back to the
         curated specimen, available whether or not Edit is on. -->
    <button
      type="button"
      class="btn btn-sm preset-tonal-surface gap-1.5 self-start"
      title="Restore the default specimen and discard your custom copy"
      onclick={resetSample}>
      <Icon name="reset" size={15} />
      {resetLabel}
    </button>
  {/if}
{/snippet}

{#if compact}
  <!-- Mobile Browse/detail bar: the primary swatch row scrolls sideways (one row,
       never a wall) and the size slider sits below it — both always visible. The
       toggles and the secondary swatch set live in the "more" popover. -->
  <div
    class="flex flex-col gap-2 border-b border-surface-200-800 bg-surface-100-900 px-3 py-2">
    <div class="flex items-center gap-2">
      <div
        class="swatch-scroll flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto"
        role="group"
        aria-label={primaryKind === 'specimen'
          ? 'Specimen color scheme'
          : 'Code editor theme'}>
        {@render swatchButtons(primaryKind)}
      </div>
      <Popover positioning={{ placement: 'bottom-end' }}>
        <Popover.Trigger
          class="btn-icon btn-icon-sm preset-tonal-surface shrink-0"
          aria-label="More display options">
          <Icon name="sliders" size={18} />
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content
              class="card z-50 flex w-64 flex-col gap-3 border border-surface-200-800 bg-surface-100-900 p-3 shadow-xl">
              <div class="flex flex-col gap-2">
                {@render toggles()}
              </div>
              {#if secondaryKind}
                <div
                  class="flex flex-col gap-1.5 border-t border-surface-200-800 pt-3">
                  <span class="text-sm">Code theme</span>
                  <div
                    class="flex flex-wrap items-center gap-1.5"
                    role="group"
                    aria-label="Code editor theme">
                    {@render swatchButtons(secondaryKind)}
                  </div>
                </div>
              {/if}
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover>
    </div>
    <FontSizeSlider compact class="w-full" />
  </div>
{:else}
  <div
    class={inSheet
      ? 'flex flex-col gap-4 px-4 pb-4 pt-2'
      : 'flex flex-row flex-wrap items-center gap-x-4 gap-y-2 border-b border-surface-200-800 bg-surface-100-900 px-4 py-2'}>
    {@render toggles()}

    <!-- Specimen colour scheme: each swatch is the actual fg-on-bg pair, so you
         pick by sight. Recolours text (non-mono) specimens only; mono uses the
         code editor and ignores this — so it's hidden in a mono context. -->
    {#if showSpecimen}
      <div
        class="flex items-center gap-2"
        title="Colour schemes apply to text fonts (not mono)">
        <span id="specimen-scheme-label">Specimen:</span>
        <div
          class="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-labelledby="specimen-scheme-label">
          {@render swatchButtons('specimen')}
        </div>
      </div>
    {/if}

    <!-- Code-editor theme: each swatch is the theme's editor bg with its own fg,
         so you pick by sight. Applies to coding (mono) fonts; only shown in a
         mono (or mixed) context since text faces ignore it. -->
    {#if showCode}
      <div
        class="flex items-center gap-2"
        title="Editor themes apply to coding (mono) fonts">
        <span id="code-theme-label">Code:</span>
        <div
          class="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-labelledby="code-theme-label">
          {@render swatchButtons('code')}
        </div>
      </div>
    {/if}

    <FontSizeSlider />
  </div>
{/if}

<style>
/* The compact swatch row scrolls horizontally without a visible scrollbar; the
   partially-clipped trailing swatch is the affordance that there's more. */
.swatch-scroll {
  scrollbar-width: none;
  scroll-snap-type: x proximity;
}
.swatch-scroll::-webkit-scrollbar {
  display: none;
}
.swatch-scroll > :global(.specimen-swatch) {
  scroll-snap-align: start;
}

.specimen-swatch {
  display: inline-flex;
  flex: none;
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

/* Touch: the swatches are a tappable row, so grow the chip itself to a 44px
   target on coarse pointers — an expanded hit-area would overlap its neighbours
   at this gap. The dense desktop (pointer: fine) keeps the compact 2rem chip. */
@media (pointer: coarse) {
  .specimen-swatch {
    width: 44px;
    height: 44px;
  }
}
</style>
