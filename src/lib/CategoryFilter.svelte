<script lang="ts" generics="T extends string">
// Category selector shared by the Game (chips + segmented group) and Browse
// (chips). `categories` carries its own id/label so the same component serves
// the 5-category Game list and the 6-option Browse list (with 'all').
let {
  categories,
  selected,
  onselect,
  variant = 'chips',
  class: className = ''
}: {
  categories: readonly { id: T; label: string }[];
  selected: T;
  onselect: (id: T) => void;
  /** 'chips' = wrapped outlined buttons; 'group' = segmented btn-group. */
  variant?: 'chips' | 'group';
  class?: string;
} = $props();
</script>

{#if variant === 'group'}
  <div class="btn-group preset-outlined-surface-500 shrink-0 {className}">
    {#each categories as category (category.id)}
      <button
        class="btn btn-sm {selected === category.id
          ? 'preset-filled-primary-500'
          : ''}"
        aria-pressed={selected === category.id}
        onclick={() => onselect(category.id)}>{category.label}</button>
    {/each}
  </div>
{:else}
  <div class="flex flex-wrap gap-1 {className}">
    {#each categories as category (category.id)}
      <button
        class="btn btn-sm {selected === category.id
          ? 'preset-filled-primary-500'
          : 'preset-tonal-surface'}"
        aria-pressed={selected === category.id}
        onclick={() => onselect(category.id)}>{category.label}</button>
    {/each}
  </div>
{/if}
