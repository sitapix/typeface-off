<script lang="ts">
import Icon from './Icon.svelte';
import { persisted } from './persisted.svelte';

const mode = persisted<'light' | 'dark'>('color-scheme', 'light');

function apply(m: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('dark', m === 'dark');
  root.style.colorScheme = m;
}

// Runs only on the client; keeps <html> in sync with the stored mode.
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
