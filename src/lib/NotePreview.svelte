<script lang="ts">
let {
  fontFamily = 'Inter',
  fontSize = 20,
  class: className = ''
}: { fontFamily?: string; fontSize?: number; class?: string } = $props();

const pangram = 'The quick brown fox jumps over the lazy dog.';
const paragraph =
  'Sphinx of black quartz, judge my vow. Pack my box with five dozen liquor jugs, then ship it overnight to the waiting crew.';
const glyphs = '0123456789  .,;:!?‘’“”&@#%*()';
</script>

<div
  class="flex h-full w-full flex-col overflow-hidden rounded-lg border border-surface-300-700 bg-surface-50-950 shadow-lg {className}"
  style="font-family: '{fontFamily}', sans-serif;">
  <!-- note chrome -->
  <div
    class="flex items-center justify-between border-b border-surface-300-700 px-5 py-3">
    <span class="text-lg opacity-90">Quick note</span>
    <span class="text-sm opacity-50">Edited just now · Draft</span>
  </div>

  <!-- note body -->
  <div
    class="flex flex-1 flex-col gap-4 overflow-auto px-6 py-5 leading-relaxed"
    style="font-size: {fontSize}px;">
    <p class="opacity-95" style="font-size: {fontSize * 1.4}px;">Meeting notes</p>
    <p>{pangram}</p>
    <p class="opacity-90">{paragraph}</p>
    <p class="opacity-70" style="font-size: {fontSize * 0.9}px;">{glyphs}</p>
  </div>
</div>
