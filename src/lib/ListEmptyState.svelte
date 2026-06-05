<script lang="ts">
import Icon from './Icon.svelte';

// "No results" empty state for the font lists — Browse's FontTable and the
// detail page's inline picker. A search (and, on Browse, a type filter) excluded
// every font, so instead of a blank rail this names the miss and offers the way
// back: clear the search, and (Browse only) drop the type filter. It's not a
// first-run state — every category has fonts, so it only appears once a query
// rules them all out. Renders inside the ~320px sidebar rail, so it stays
// compact and its actions wrap.
let {
  term = '',
  categoryLabel,
  onclearSearch,
  onresetCategory
}: {
  /** The active search query, quoted back to the user when present. */
  term?: string;
  /** Active category label when the type filter is also narrowing (Browse). */
  categoryLabel?: string;
  onclearSearch: () => void;
  /** Browse only: clear the type filter back to "all". */
  onresetCategory?: () => void;
} = $props();

const trimmed = $derived(term.trim());
// "serif fonts" when a type filter is on, plain "fonts" otherwise.
const noun = $derived(
  categoryLabel ? `${categoryLabel.toLowerCase()} fonts` : 'fonts'
);
</script>

<div
  class="flex flex-col items-center gap-3 px-4 py-12 text-center"
  role="status">
  <span
    class="flex size-11 items-center justify-center rounded-full bg-surface-200-800 text-surface-800-200">
    <Icon name="search" size={22} />
  </span>
  <!-- surface-800-200 is the AA-safe muted token: it clears 4.5:1 body contrast
       on surface-100/900 across all 21 themes (the lighter -700-300 / -600-400
       steps fall under 4.5:1 on the pastel themes, e.g. Catppuccin light). -->
  <p class="text-pretty text-surface-800-200">
    {#if trimmed}
      No {noun} match
      <span class="font-semibold text-surface-900-100">“{trimmed}”</span>.
    {:else}
      No {noun} to show.
    {/if}
  </p>
  <div class="flex flex-wrap items-center justify-center gap-2">
    {#if trimmed}
      <button
        type="button"
        class="btn btn-sm preset-tonal-surface gap-1.5"
        onclick={onclearSearch}>
        <Icon name="x" size={15} />
        Clear search
      </button>
    {/if}
    {#if categoryLabel && onresetCategory}
      <button
        type="button"
        class="btn btn-sm preset-tonal-surface"
        onclick={onresetCategory}>
        Show all types
      </button>
    {/if}
  </div>
</div>
