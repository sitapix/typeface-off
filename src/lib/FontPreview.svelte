<script lang="ts">
import type { FontCategory } from '$lib/fonts';
import NotePreview from './NotePreview.svelte';
import CodePreview from './CodePreview.svelte';
import SpecimenPreview from './SpecimenPreview.svelte';

// Picks the specimen for a font:
//   • mono              → syntax-highlighted code block (CodePreview)
//   • variant=specimen  → type-specimen for the Game duel
//   • else (default)    → article + type-tester (NotePreview), used by Browse/detail
let {
  family = 'Inter',
  category = 'sans',
  fontSize = 20,
  ligatures = true,
  class: className = '',
  editable = false,
  text = '',
  variant = 'article',
  seed = 0,
  compact = false
}: {
  family?: string;
  category?: FontCategory;
  fontSize?: number;
  ligatures?: boolean;
  class?: string;
  editable?: boolean;
  text?: string;
  /** 'specimen' = clean Game-duel specimen; 'article' = Browse/detail reader. */
  variant?: 'article' | 'specimen';
  /** Per-bracket counter for the specimen variant (ignored otherwise). */
  seed?: number;
  /** Specimen variant: trim to essentials for the short stacked mobile duel. */
  compact?: boolean;
} = $props();
</script>

{#if category === 'mono'}
  <CodePreview
    fontFamily={family}
    fontSize={fontSize}
    ligatures={ligatures}
    class={className} />
{:else if variant === 'specimen'}
  <SpecimenPreview
    fontFamily={family}
    fontSize={fontSize}
    category={category}
    seed={seed}
    compact={compact}
    class={className} />
{:else}
  <NotePreview
    fontFamily={family}
    fontSize={fontSize}
    class={className}
    editable={editable}
    text={text} />
{/if}
