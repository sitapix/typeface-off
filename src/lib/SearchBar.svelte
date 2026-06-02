<script lang="ts">
import { onMount } from 'svelte';
import { searchTerm } from '$lib/store.svelte';

let placeholderText = $state('Search …');
let searchInput: HTMLInputElement;

onMount(() => {
  const ua = navigator.userAgent.toUpperCase();
  if (ua.includes('MAC')) placeholderText = '⌘ K to Search …';
  else if (ua.includes('WIN')) placeholderText = 'Ctrl K to Search …';
});

function handleKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    searchInput.focus();
    event.preventDefault();
  }
}
</script>

<svelte:window onkeydown={handleKeydown} />

<input
  bind:this={searchInput}
  class="input max-w-[40rem] px-4 py-2"
  type="search"
  aria-label="Search fonts"
  autocomplete="off"
  bind:value={searchTerm.value}
  placeholder={placeholderText} />
