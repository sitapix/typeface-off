<script lang="ts" generics="T extends string">
import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';

// Single-select category picker, rendered as a Skeleton SegmentedControl so it
// reads as one "pick exactly one type" control. Uses the same btn-group styling
// as +page.svelte's bracket-size toggle (modeToggle), so the two pickers look
// like siblings. Generic over the id type: serves the Game's 5 real categories
// and Browse's 6 (with 'all'). Labels are short and set at the DESIGN label size
// (text-xs) with tight padding so all 5-6 segments stay legible — never
// truncated — even in the ~318px sidebar rail.
let {
  categories,
  selected,
  onselect,
  class: className = ''
}: {
  categories: readonly { id: T; label: string }[];
  selected: T;
  onselect: (id: T) => void;
  class?: string;
} = $props();
</script>

<SegmentedControl
  value={selected}
  onValueChange={(d) => {
    // Never allow an empty selection — a bracket/filter always has a category.
    if (d.value) onselect(d.value as T);
  }}
  aria-label="Filter by type"
  class="btn-group preset-outlined-surface-500 flex w-full {className}">
  {#each categories as category (category.id)}
    <SegmentedControl.Item
      value={category.id}
      class="btn btn-sm min-w-0 flex-1 cursor-pointer px-1 text-xs font-semibold data-[state=checked]:preset-filled-primary-500">
      <SegmentedControl.ItemText>{category.label}</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
  {/each}
</SegmentedControl>
