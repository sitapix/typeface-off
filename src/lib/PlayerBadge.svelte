<script lang="ts">
import type { Snippet } from 'svelte';
let {
  class: className = '',
  children
}: { class?: string; children?: Snippet } = $props();
</script>

<div class="bracket-candidate {className}">
  <div class="left-dot"></div>
  <div class="left-line"></div>
  <div class="right-dot"></div>
  <div class="right-line"></div>
  <div class="truncate text-sm">{@render children?.()}</div>
</div>
