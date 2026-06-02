<script lang="ts">
import type { Font } from '$lib/fonts';
import FontHeader from './FontHeader.svelte';
import FontPreview from './FontPreview.svelte';

// A font header + its specimen — the repeated unit in Browse and the detail
// page's two-column (main + compare) layouts. The caller owns the surrounding
// column/grid; this is just the header-over-preview pair.
let {
  font,
  fontSize = 20,
  ligatures = true,
  previewClass = 'overflow-hidden rounded-lg',
  editable = false,
  text = ''
}: {
  font?: Font;
  fontSize?: number;
  ligatures?: boolean;
  previewClass?: string;
  editable?: boolean;
  text?: string;
} = $props();
</script>

<FontHeader font={font} />
<FontPreview
  class={previewClass}
  fontSize={fontSize}
  family={font?.family}
  category={font?.category}
  ligatures={ligatures}
  editable={editable}
  text={text} />
