<script lang="ts">
import type { FontCategory } from '$lib/fonts';
import NotePreview from './NotePreview.svelte';
import CodePreview from './CodePreview.svelte';
import SpecimenPreview from './SpecimenPreview.svelte';

// Picks the specimen for a font:
//   • mono              → typeable Shiki code editor (CodePreview)
//   • variant=specimen  → type-specimen for the Game duel (SpecimenPreview)
//   • else (default)    → article reader (NotePreview), used by Browse/detail
//
// Editability is the global `editMode` store, read by each specimen directly —
// off = display + tap-to-pick, on = typeable. There's no per-instance editable
// prop; coding fonts and text alike become typeable when Edit is on.
let {
  family = 'Inter',
  category = 'sans',
  fontSize = 20,
  ligatures = true,
  class: className = '',
  variant = 'article',
  seed = 0,
  compact = false
}: {
  family?: string;
  category?: FontCategory;
  fontSize?: number;
  ligatures?: boolean;
  class?: string;
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
  <NotePreview fontFamily={family} fontSize={fontSize} class={className} />
{/if}
