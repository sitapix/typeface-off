<script lang="ts">
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);

let {
  fontFamily = 'JetBrains Mono',
  fontSize = 16,
  ligatures = true,
  class: className = ''
}: {
  fontFamily?: string;
  fontSize?: number;
  ligatures?: boolean;
  class?: string;
} = $props();

// Front-loaded coding-font sample: real code (operators, brackets, numbers, the
// 0/o/O and l/1/I tests) sits up top so even a short mobile panel shows the
// glyphs that matter; the multi-line comment (for judging italics) moves to the
// end. Still exercises =>, ===, !==, <= that coding fonts are judged on.
const CODE = `// glance test: 0 o O / l 1 I / => === !== <= >=
const isMultipleOf = (number, multiple) => {
  if (number === 0) return '0 is a neutral element';
  for (let i = 1; i <= 10; i++) {
    if ((number * i) % multiple === 0) {
      console.log(number * i + ' is a multiple of ' + multiple);
    } else {
      console.log(number * i + ' is not a multiple');
    }
  }
};

let oO0 = 0; // Zero  (tell 0 from o and O)
let l1I = 1; // One   (tell l from 1 and I)

/* a multi-line comment, kept down here so italics still
   get a few lines without burying the code up top */
isMultipleOf(oO0, l1I); // => related to zero
isMultipleOf(l1I, oO0); // => related to one`;

// Highlighted once at module/import time — deterministic, so SSR and client
// markup match (no hydration mismatch).
const highlighted = hljs.highlight(CODE, { language: 'javascript' }).value;

// One label per source line. The gutter shares the code's line-height so rows
// line up, but renders in a neutral mono so both duel panels' code starts at the
// same x regardless of the specimen's digit width.
const lineNumbers = Array.from(
  { length: CODE.split('\n').length },
  (_, i) => i + 1
).join('\n');

const ligCss = $derived(
  ligatures
    ? 'font-variant-ligatures: contextual; font-feature-settings: "calt" 1, "liga" 1;'
    : 'font-variant-ligatures: none; font-feature-settings: "calt" 0, "liga" 0;'
);
</script>

<div
  class="code-preview flex h-full w-full flex-col overflow-hidden rounded-lg border border-[#2a2a2a] shadow-lg {className}">
  <!-- editor chrome -->
  <div
    class="flex items-center gap-2 border-b border-[#2a2a2a] bg-[#252526] px-4 py-3">
    <span class="h-3 w-3 rounded-full bg-[#ff5f56]"></span>
    <span class="h-3 w-3 rounded-full bg-[#ffbd2e]"></span>
    <span class="h-3 w-3 rounded-full bg-[#27c93f]"></span>
    <span class="ml-2 text-sm text-[#9da5b4]">example.js</span>
  </div>

  <!-- code body: a line-number gutter + the specimen-font code on one scroll
       grid, so lines align row-for-row (the original used an editor gutter for
       this). Gutter = neutral mono; code keeps the specimen font + ligatures. -->
  <div
    class="code-scroll flex-1 overflow-auto bg-[#1e1e1e]"
    style="font-size: {fontSize}px; line-height: 1.6;">
    <div class="code-grid">
      <pre class="ln-gutter" aria-hidden="true">{lineNumbers}</pre>
      <pre class="code-pre text-[#d4d4d4]"><code
          class="hljs"
          style="font-family: '{fontFamily}', monospace; {ligCss}"
          >{@html highlighted}</code></pre>
    </div>
  </div>
</div>

<style>
:global(.code-preview .hljs-comment) {
  color: #6a9955;
  font-style: italic;
}
:global(.code-preview .hljs-keyword),
:global(.code-preview .hljs-literal) {
  color: #569cd6;
}
:global(.code-preview .hljs-string) {
  color: #ce9178;
}
:global(.code-preview .hljs-number) {
  color: #b5cea8;
}
:global(.code-preview .hljs-title),
:global(.code-preview .hljs-title.function_) {
  color: #dcdcaa;
}
:global(.code-preview .hljs-params) {
  color: #9cdcfe;
}
:global(.code-preview .hljs-built_in) {
  color: #4ec9b0;
}
:global(.code-preview .hljs-variable),
:global(.code-preview .hljs-attr) {
  color: #9cdcfe;
}

/* line-number gutter + code share one flex/scroll grid so rows line up */
.code-grid {
  display: flex;
  min-width: 100%;
  width: max-content;
}
.code-grid pre {
  margin: 0;
  padding-top: 1.1rem;
  padding-bottom: 1.1rem;
  white-space: pre;
  tab-size: 2;
}
.ln-gutter {
  position: sticky;
  left: 0;
  z-index: 1;
  flex: 0 0 auto;
  padding-left: 1.1rem;
  padding-right: 0.85rem;
  text-align: right;
  color: #6e7681;
  background: #1e1e1e;
  border-right: 1px solid #2a2a2a;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-variant-numeric: tabular-nums;
  user-select: none;
}
.code-pre {
  flex: 1 1 auto;
  padding-left: 1rem;
  padding-right: 1.5rem;
}
</style>
