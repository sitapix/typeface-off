<script lang="ts">
import { showName, fontSize } from '$lib/store.svelte';
</script>

<div
  class="flex flex-row items-center gap-4 overflow-x-auto whitespace-nowrap border-b border-surface-200-800 bg-surface-100-800 px-4 py-2">
  <label class="flex items-center space-x-2">
    <input class="checkbox" type="checkbox" bind:checked={showName.value} />
    <span>Show Name</span>
  </label>
  <label class="flex flex-row items-center gap-2 whitespace-nowrap">
    <span>Font Size:</span>
    <input
      class="input w-16"
      type="number"
      min="10"
      max="72"
      bind:value={fontSize.value} />
    <input
      class="w-40 accent-primary-500 lg:w-60"
      type="range"
      min="10"
      max="72"
      step="1"
      bind:value={fontSize.value} />
  </label>
</div>
