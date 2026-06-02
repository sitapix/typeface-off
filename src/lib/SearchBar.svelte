<script lang="ts">
import { onMount } from 'svelte';
import { searchTerm } from '$lib/store.svelte';

let placeholderText = 'Search …';
let searchInput: HTMLInputElement;

onMount(() => {
  if (navigator.userAgent.toUpperCase().includes('MAC')) {
    placeholderText = '⌘ K to Search …';
  } else if (navigator.userAgent.toUpperCase().includes('WIN')) {
    placeholderText = 'Ctrl K to Search …';
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      searchInput.focus();
      event.preventDefault();
    }
  };

  window.addEventListener('keydown', handleKeydown);
  return () => window.removeEventListener('keydown', handleKeydown);
});
</script>

<input
  bind:this={searchInput}
  class="input max-w-[40rem] px-4 py-2"
  type="search"
  aria-label="Search fonts"
  autocomplete="off"
  bind:value={searchTerm.value}
  placeholder={placeholderText} />
