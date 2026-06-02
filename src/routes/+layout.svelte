<script lang="ts">
import '../app.css';

let { children } = $props();
</script>

{@render children()}

<canvas
  id="canvas"
  class="pointer-events-none fixed inset-0 z-[100] h-full w-full"></canvas>
