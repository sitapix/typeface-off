<script lang="ts">
import Icon from './Icon.svelte';
import { colorScheme as mode } from './store.svelte';

function apply(m: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('dark', m === 'dark');
  root.style.colorScheme = m;
}

// Runs only on the client; keeps <html> in sync with the shared mode store.
// This header switch is always mounted (display:none when hidden, still mounted),
// so it remains the single applier even when the mobile sheet drives the value.
$effect(() => {
  apply(mode.value);
});

function toggle() {
  mode.value = mode.value === 'dark' ? 'light' : 'dark';
}
</script>

<button
  class="btn-icon preset-tonal-surface"
  onclick={toggle}
  aria-label="Toggle dark mode"
  title="Toggle dark mode">
  <Icon name={mode.value === 'dark' ? 'sun' : 'moon'} size={22} />
</button>
