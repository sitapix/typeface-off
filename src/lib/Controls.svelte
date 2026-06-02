<script lang="ts">
import { showName, fontSize, ligatures } from '$lib/store.svelte';
</script>

<div
  class="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 border-b border-surface-200-800 bg-surface-100-800 px-4 py-2">
  <label class="flex items-center space-x-2">
    <input class="checkbox" type="checkbox" bind:checked={showName.value} />
    <span>Show Name</span>
  </label>
  <label class="flex items-center space-x-2" title="Ligatures apply to coding (mono) fonts">
    <input class="checkbox" type="checkbox" bind:checked={ligatures.value} />
    <span>Ligatures</span>
  </label>
  <label class="flex flex-1 flex-row items-center gap-2 whitespace-nowrap">
    <span>Font Size:</span>
    <input
      class="input w-16"
      type="number"
      min="10"
      max="72"
      bind:value={fontSize.value} />
    <input
      class="min-w-32 flex-1 accent-primary-500 lg:max-w-60"
      type="range"
      min="10"
      max="72"
      step="1"
      bind:value={fontSize.value} />
  </label>
</div>
