<script lang="ts">
import type { FontCategory } from '$lib/fonts';
import NotePreview from './NotePreview.svelte';
import CodePreview from './CodePreview.svelte';

// Picks the right specimen for a font: a syntax-highlighted code block for
// monospace/coding fonts, the note-app card for everything else.
let {
  family = 'Inter',
  category = 'sans',
  fontSize = 20,
  ligatures = true,
  class: className = ''
}: {
  family?: string;
  category?: FontCategory;
  fontSize?: number;
  ligatures?: boolean;
  class?: string;
} = $props();
</script>

{#if category === 'mono'}
  <CodePreview
    fontFamily={family}
    fontSize={fontSize}
    ligatures={ligatures}
    class={className} />
{:else}
  <NotePreview fontFamily={family} fontSize={fontSize} class={className} />
{/if}
