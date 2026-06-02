<script lang="ts">
// Text wordmark logo. `class` controls sizing (font-size) from the caller.
let { class: className = '' }: { class?: string } = $props();
</script>

<span
  class="inline-flex items-baseline font-extrabold tracking-tight whitespace-nowrap {className}">
  <span>Typeface</span><span class="text-primary-500">Off</span>
</span>
