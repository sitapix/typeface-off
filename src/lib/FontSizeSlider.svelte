<script lang="ts">
import { Slider } from '@skeletonlabs/skeleton-svelte';
import { fontSize } from '$lib/store.svelte';

// Shared specimen font-size control: a precise number field plus a Skeleton
// Slider, both bound to the `fontSize` store. Used in the Controls bar and in
// the Browse mobile drawer (so size is adjustable while scrolling the list).
const MIN = 10;
const MAX = 72;

// Keep a stray typed value in the number field within slider range.
function clamp(n: number) {
  if (Number.isNaN(n)) return fontSize.value;
  return Math.min(MAX, Math.max(MIN, Math.round(n)));
}

// `compact` = the mobile Browse/detail bar, where the row shares a narrow phone
// width. Drops the long "Font Size:" label and the min-width floor so the slider
// shrinks to fit instead of overflowing off the right edge.
let {
  class: className = 'flex-1',
  compact = false
}: {
  class?: string;
  compact?: boolean;
} = $props();
</script>

<div
  class="flex flex-row items-center gap-2 {compact
    ? ''
    : 'whitespace-nowrap'} {className}">
  <label class="flex shrink-0 items-center gap-2">
    <span>{compact ? 'Size' : 'Font Size:'}</span>
    <input
      class="input w-16"
      type="number"
      inputmode="numeric"
      min={MIN}
      max={MAX}
      value={fontSize.value}
      oninput={(e) =>
        (fontSize.value = clamp(e.currentTarget.valueAsNumber))} />
  </label>
  <span class="shrink-0 text-sm opacity-60">px</span>
  <Slider
    value={[fontSize.value]}
    onValueChange={(d) => (fontSize.value = d.value[0])}
    min={MIN}
    max={MAX}
    step={1}
    aria-label={['Font size']}
    class={compact ? 'min-w-0 flex-1' : 'min-w-32 flex-1 lg:max-w-60'}>
    <Slider.Control class="relative flex items-center py-2">
      <Slider.Track class="h-1.5 flex-1 rounded-full bg-surface-300-700">
        <Slider.Range class="h-full rounded-full bg-primary-500" />
      </Slider.Track>
      <Slider.Thumb
        index={0}
        class="size-4 cursor-grab rounded-full border border-surface-50-950 bg-primary-500 shadow transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
        <Slider.HiddenInput />
      </Slider.Thumb>
    </Slider.Control>
  </Slider>
</div>
